require('dotenv').config({
  path: 'config/.env'
});

const { Client, Intents } = require('discord.js');
const { registerCommands } = require('./handlers/commands');
const { initializeListeners } = require('./handlers/listeners');
const { log } = require('./handlers/logger.js');
const { getFiles } = require('./utils/tools.js');
const nodePath = require('path');

(async () => {
  const client = new Client({
    intents: [
      Intents.FLAGS.GUILDS,
      Intents.FLAGS.GUILD_MESSAGES,
      Intents.FLAGS.GUILD_MEMBERS
    ],
    fetchAllMembers: true
  });
  registerCommands(client);
  initializeListeners(client);
  await require('./mongo/connection')();
  client.json = {};
  for (let path of getFiles('config/', '.json')) {
    path = path.replaceAll(nodePath.sep, '/');
    client.json[path.slice(path.lastIndexOf('/') + 1, path.length - 5)] = require(path);
  }
  log('Bound config/*.json to client.json', 'success');
  client.login(process.env.DISCORD_TOKEN);
})();
