require('dotenv').config()

const { Client, Intents } = require('discord.js')
const { registerCommands } = require('./handlers/commands.js')
const { initializeListeners } = require('./handlers/listeners.js');

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
  client.login(process.env.DISCORD_TOKEN)
})()
