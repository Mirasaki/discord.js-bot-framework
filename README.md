<div align="center">

![JDB](assets/JDBWide.png)
# discord.js-bot-framework
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/7090099b5a5d4a1c9bd83602b326fa82)](https://app.codacy.com/gh/Destinovant/discord.js-bot-framework?utm_source=github.com&utm_medium=referral&utm_content=Destinovant/discord.js-bot-framework&utm_campaign=Badge_Grade_Settings)

This is a simple framework/template used whenever I create a new discord.js client/bot. It's simple to understand, and quick/easy to modify. You don't need much Javascript experience to get started on your own project using this framework, but have you always wanted to make your own Discord bot and you're not sure where to start? Come join my [Discord Server](https://discord.gg/KfHFhGNPvz), where I'll try and answer all the questions you have.
</div>

---
## Requirements
- A [MongoDB](https://www.mongodb.com/2) database
    * Read [this guide](https://docs.mongodb.com/manual/administration/install-community/) if you need help creating one
- [Node/NodeJS](https://nodejs.org/en/)
    * Be sure to check the box that says "Automatically install the necessary tools" if you're running the installation wizard

## Hosting
**1)** `cd` into your project folder

**2)** Run the command: `git clone https://github.com/Destinovant/discord.js-bot-framework`

**3)** Run the command `cd discord.js-bot-framework`

**4)** `npm i` to install all dependencies

**5)** Copy and paste `.env.example`, than rename it to `.env`

**6)** Open the new `.env` file and provide your bot token and MongoDB link

**7)** `node .` to start the application or `npm run dev` if you have `nodemon` installed for automatic restarts on changes