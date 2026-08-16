# Discord Broadcast Bot 🤖

A streamlined Discord broadcast bot built using **Discord.js v13**. This bot allows server administrators to seamlessly broadcast customized messages or announcements across designated channels or to specific roles.

## 🚀 Features

* 📢 Efficient bulk messaging and broadcasting system.
* ⚙️ Easy setup using a local configuration file.
* 📑 Error logging automated via native JSON and log tracking files.

## 📦 Prerequisites

Before setting up the bot, ensure you have the following installed on your machine:
* [Node.js](https://nodejs.org) (**Version 16.x or lower** is strictly required for Discord.js v13 compatibility)
* A code editor like [VS Code](https://visualstudio.com) or Notepad++

## 💻 Installation & Setup

Follow these steps to get your broadcast bot up and running:

### 1. Clone the Repository

Download or clone this repository to your local system:
```bash
git clone https://github.com/mohamedtechturf/Discord-Broadcast-Bot
cd Discord-Broadcast-Bot
```

### 2. Install Dependencies

Initialize the necessary node modules by running:
```bash
npm install
```

### 3. Create a Discord Bot Application

1. Go to the [Discord Developer Portal](https://discord.com).
2. Click **New Application** and give your bot a name.
3. Navigate to the **Bot** menu option on the left side bar.
4. Click **Add Bot**, then click **Reset Token** to copy your unique bot token.
5. **Crucial:** Scroll down to the **Privileged Gateway Intents** section and turn **ON** the following toggles:
   * Presence Intent
   * Server Members Intent
   * Message Content Intent
6. Invite the bot to your server using the OAuth2 URL generator (give it `Administrator` or `Send Messages` and `Embed Links` permissions).

### 4. Configuration

Open your local `config.json` file and insert your credentials. Your file layout should resemble the following structure:

```json
{
  "token": "PASTE_YOUR_DISCORD_BOT_TOKEN_HERE",
  "prefix": "!"
}
```

### 5. Running the Bot

To start the bot, you can choose either of these methods:
* **Windows Users:** Double-click the provided `RUN.bat` script file.
* **Terminal Users:** Open your terminal in the root folder and run:
  ```bash
  node index.js
  ```

## Troubleshooting

If the bot runs into unexpected crashes or fails to send a message, check the generated local debugging files:
* `error.log`: Text logs containing exact system execution crash reports.
* `errors.json`: Structured registry tracking internal automation exceptions.
* If you find any bugs, feel free to open an [issue](../../issues).

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
