const { Client, GatewayIntentBits, Events, PermissionsBitField, EmbedBuilder } = require('discord.js');
const { mainBotToken, prefix } = require('./config.json');
const fs = require('fs');
const path = require('path');

let lastCommandChannel = null;

const errorsPath = path.join(__dirname, 'errors.json');
let errorCodes = [];
if (fs.existsSync(errorsPath)) {
    errorCodes = JSON.parse(fs.readFileSync(errorsPath, 'utf-8'));
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
    ],
});

client.once(Events.ClientReady, () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;

    const isEveryoneMentioned = message.mentions.everyone || message.mentions.has(message.guild.roles.everyone);

    if (message.content.startsWith(prefix)) {
        const args = message.content.slice(1).trim().split(/ +/);
        const command = args.shift().toLowerCase();

        lastCommandChannel = message.channel;

        if (command === 'ping') {
            const sent = await message.reply('Pinging...');
            const latency = sent.createdTimestamp - message.createdTimestamp;
            sent.edit(`Pong! Latency is ${latency}ms. API Latency is ${Math.round(client.ws.ping)}ms.`);
            return;
        }

        if (command === 'bc' || command === 'obc') {
            if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                return message.reply('You do not have permission to use this command.');
            }

            const broadcastMessage = args.join(' ');

            if (!broadcastMessage) {
                return message.reply('Please provide a message to broadcast.');
            }

            if (broadcastMessage.length > 1000) {
                return message.reply('The broadcast message cannot exceed 1000 characters.');
            }

            await message.reply('Starting...');

            await message.guild.members.fetch();

            const members = message.guild.members.cache;
            let successCount = 0;
            let failCount = 0;

            for (const [id, member] of members) {
                if (member.user.bot) continue;

                if (command === 'obc') {
                    const status = member.presence?.status;
                    if (!(status === 'online' || status === 'idle' || status === 'dnd')) {
                        continue;
                    }
                }

                try {
                    await member.send(broadcastMessage);
                    console.log(`Message sent to ${member.user.tag}: ${broadcastMessage}`);
                    successCount++;
                } catch (error) {
                    console.error(`Could not send DM to ${member.user.tag}: ${error}`);
                    failCount++;

                    if (error.code === 20026) {
                        if (lastCommandChannel) {
                            const embed = new EmbedBuilder()
                                .setAuthor({
                                    name: "Your bot has been banned",
                                    url: "https://discord.com/terms",
                                    iconURL: client.user.displayAvatarURL()
                                })
                                .setTitle("Click here to buy a new bot")
                                .setURL("https://discord.com/invite/z8EpwSpXwD")
                                .setDescription("Your bot has been banned by Discord's API Anti-Spam system because it reached the rate limit of sending messages.")
                                .addFields({
                                    name: "Broadcast state before ban:",
                                    value: `**Success:** ${successCount}, **Failures:** ${failCount}.`,
                                    inline: false,
                                })
                                .setThumbnail("https://media.discordapp.net/attachments/1183690505264058448/1276883287469457489/denied.png?ex=66cb25bb&is=66c9d43b&hm=cea0e31118c1e38b8fa297dc8e13de4c4f71bb54caed62eafe32eb5e12f007c1&=&format=webp&quality=lossless&width=468&height=468")
                                .setColor("#ff0000")
                                .setFooter({
                                    text: "By ThraxCast",
                                    iconURL: "https://images-ext-1.discordapp.net/external/fnT9iHIEIQfq41pNaJvRKHKol1HHDsh3y-Uyb1h_CD4/%3Fsize%3D1024/https/cdn.discordapp.com/icons/1163179670968205333/a_ea12d747912047a77fd30fa25e277d00.gif",
                                })
                                .setTimestamp();

                            await lastCommandChannel.send({ embeds: [embed] });
                        }
                        console.error('Rate limit exceeded, shutting down...');
                        process.exit(1);
                    } else {
                        logError(error);
                    }
                }
            }

            return message.reply(`Broadcast message sent. Success: ${successCount}, Failures: ${failCount}.`);
        }

        if (command === 'support') {
            const displayName = message.author.displayName;
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setAuthor({
                    name: "Support server",
                    iconURL: client.user.displayAvatarURL()
                })
                .setTitle(`Hello ${displayName}, If you have any problem with the bot contact us`)
                .setDescription("Click on the link above to be redirected to the support server")
                .setURL("https://discord.gg/9qBvzRrcwe")
                .setThumbnail(message.guild.iconURL({ size: 2048 }))
                .setFooter({
                    text: "By ThraxCast",
                    iconURL: "https://images-ext-1.discordapp.net/external/fnT9iHIEIQfq41pNaJvRKHKol1HHDsh3y-Uyb1h_CD4/%3Fsize%3D1024/https/cdn.discordapp.com/icons/1163179670968205333/a_ea12d747912047a77fd30fa25e277d00.gif",
                })
                .setTimestamp();

            await message.reply({ embeds: [embed] });
            return;
        }

        if (command === 'help') {
            const displayName = message.member.displayName;
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setAuthor({
                    name: "Commands List",
                    iconURL: client.user.displayAvatarURL()
                })
                .setTitle(`Hello ${displayName}, How can I help you?`)
                .setDescription(`**${prefix}help**\n> \`Shows a guide of how to use the bot.\`\n**${prefix}obc**\n> \`Sends a specific message only to online members in the server.\`\n**${prefix}bc**\n> \`Sends a specific message to all members in the server.\`\n**${prefix}support**\n> \`Sends the official support server\`\n**${prefix}ping**\n> \`Pings the bot to test its latency.\``)
                .setThumbnail(message.guild.iconURL({ size: 2048 }))
                .setFooter({
                    text: "By ThraxCast",
                    iconURL: "https://images-ext-1.discordapp.net/external/fnT9iHIEIQfq41pNaJvRKHKol1HHDsh3y-Uyb1h_CD4/%3Fsize%3D1024/https/cdn.discordapp.com/icons/1163179670968205333/a_ea12d747912047a77fd30fa25e277d00.gif",
                })
                .setTimestamp();

            await message.reply({ embeds: [embed] });
            return;
        }
    }

    if (isEveryoneMentioned) {
        return;
    }

    if (message.mentions.has(client.user)) {
        const displayName = message.author.displayName;
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setAuthor({
                name: "Commands List",
                iconURL: client.user.displayAvatarURL()
            })
            .setTitle(`Hello ${displayName}, How can I help you?`)
            .setDescription(`**${prefix}help**\n> \`Shows a guide of how to use the bot.\`\n**${prefix}obc**\n> \`Sends a specific message only to online members in the server.\`\n**${prefix}bc**\n> \`Sends a specific message to all members in the server.\`\n**${prefix}support**\n> \`Sends the official support server\`\n**${prefix}ping**\n> \`Pings the bot to test its latency.\``)
            .setThumbnail(message.guild.iconURL({ size: 2048 }))
            .setFooter({
                text: "By ThraxCast",
                iconURL: "https://images-ext-1.discordapp.net/external/fnT9iHIEIQfq41pNaJvRKHKol1HHDsh3y-Uyb1h_CD4/%3Fsize%3D1024/https/cdn.discordapp.com/icons/1163179670968205333/a_ea12d747912047a77fd30fa25e277d00.gif",
            })
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    }
});

function logError(error) {
    if (error.code && errorCodes.includes(error.code)) {
        console.log(`Error code ${error.code} is listed in errors.json. Skipping logging.`);
        return;
    }

    const errorLogPath = path.join(__dirname, 'error.log');
    const errorDetails = `Date: ${new Date().toISOString()}\nCode: ${error.code}\nMessage: ${error.message}\nStack: ${error.stack}\n\n`;

    fs.appendFile(errorLogPath, errorDetails, (err) => {
        if (err) {
            console.error('Failed to write to error.log:', err);
        } else {
            console.log('Error logged to error.log');
        }
    });
}

client.login(mainBotToken);