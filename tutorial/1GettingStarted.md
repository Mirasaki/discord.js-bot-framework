## Requirements
- A [MongoDB](https://www.mongodb.com/2) database
    * Read [this guide](https://docs.mongodb.com/manual/administration/install-community/) if you need help creating one, this takes ~15 minutes to set up if it's your first time doing so.
    * Get a [MongoDB server hosted in the cloud](https://www.mongodb.com/cloud/atlas?tck=docs_server "MongoDB Atlas Cloud Solution") which requires no installation overhead and offers a free tier to get started.
- [Node/NodeJS](https://nodejs.org/en/)
    * Be sure to check the box that says "Automatically install the necessary tools" if you're running the installation wizard

# Option 1 - Downloading
**1)** Head over to [the download page](https://github.com/Destinovant/discord.js-bot-framework/releases)

**2)** Download either the `zip` or `zip.gz` source code

**3)** Extract it using [your favorite tool](https://www.rarlab.com/download.htm)

**4)** Open the folder containing your recently extracted files

**5)** Open a console/terminal/shell prompt in this directory
- Run `npm i` to install all dependencies

**6)** Copy and paste `.env.example` from `config/`, and rename it to `.env`
  - Provide all your configuration values in this file
  - Also provide the values in `config.json`

**7)** Use `node .` to start the application or `npm run dev` if you have `nodemon` installed for automatic restarts on changes

# Option 2 - Cloning
**1)** `cd` into your project folder

**2)** Run the command: `git clone https://github.com/Destinovant/discord.js-bot-framework`, this will create a new directory named `discord.js-bot-framework`

**3)** Run the command `cd discord.js-bot-framework`

**4)** Use `npm i` to install all dependencies

**5)** Copy and paste `.env.example` from `config/`, and rename it to `.env`

**6)** Open the new `.env` file and provide all your configuration values
  - Also provide the values in `config.json`

**7)** Use `node .` to start the application or `npm run dev` if you have `nodemon` installed for automatic restarts on changes

## That's all!
You have now successfully set-up this Discord bot framework.

[Continue to **2) Adding Commands**](./2AddingCommands.md)