require('dotenv').config({
  path: 'config/.env'
})

const { Client, Intents } = require('discord.js')
const { registerCommands } = require('./handlers/commands.js')
const { initializeListeners } = require('./handlers/listeners.js')
const { log } = require('./handlers/logger.js')
const { getFiles } = require('./tools.js');

(async () => {
  const client = new Client({
    intents: [
      Intents.FLAGS.GUILDS,
      Intents.FLAGS.GUILD_MESSAGES,
      Intents.FLAGS.DIRECT_MESSAGES,
      Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
      Intents.FLAGS.GUILD_VOICE_STATES,
      Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
      Intents.FLAGS.GUILD_MEMBERS
    ],
    fetchAllMembers: true
  })
  registerCommands(client)
  initializeListeners(client)
  await require('./mongoConnection')()
  client.json = {}
  for (let path of getFiles('config/', '.json')) {
    path = path.replace(/\\/g, '/')
    client.json[path.slice(path.lastIndexOf('/') + 1, path.length - 5)] = require(path)
  }
  console.log(client.json)
  log('Bound config/*.json to client.json', 'success')
  client.login(process.env.DISCORD_TOKEN)
})()
