## Requirements
- A [MongoDB](https://www.mongodb.com/2) database
    * Read [this guide](https://docs.mongodb.com/manual/administration/install-community/) if you need help creating one, this takes ~15 minutes to set up if it's your first time doing so.
    * Get a [MongoDB server hosted in the cloud](https://www.mongodb.com/cloud/atlas?tck=docs_server "MongoDB Atlas Cloud Solution") which requires no installation overhead and offers a free tier to get started.
- [Node/NodeJS](https://nodejs.org/en/)
    * Be sure to check the box that says "Automatically install the necessary tools" if you're running the installation wizard

## Hosting
**1)** `cd` into your project folder

**2)** Run the command: `git clone https://github.com/Destinovant/discord.js-bot-framework`, this will create a new directory named `discord.js-bot-framework`

**3)** Run the command `cd discord.js-bot-framework`

**4)** Use `npm i` to install all dependencies

**5)** Copy and paste `.env.example` from `config/`, and rename it to `.env`

**6)** Open the new `.env` file and provide all your configuration values

**7)** `node .` to start the application or `npm run dev` if you have `nodemon` installed for automatic restarts on changes