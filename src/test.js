module.exports.startedAt = Date.now();

const { loadCommands } = require('./handlers/commands');
const { loadListeners } = require('./handlers/listeners');

const { Client } = require('discord.js');

const client = new Client({ ws: { intents: ['GUILDS', 'GUILD_MESSAGES'] } });

require('./clientExtensions.js')(client);
require('dotenv').config();

console.log('\nBegin Initialization!\n');
loadCommands(client);
loadListeners(client);

/*
    Created in
    Node v12.18.2
    discord.js v12.15.1
*/