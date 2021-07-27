require('dotenv').config({
  path: 'config/.env'
})

const { Client, Intents } = require('discord.js')
const { registerCommands } = require('./handlers/commands.js')
const { initializeListeners } = require('./handlers/listeners.js')
const { connect, connection } = require('mongoose')
const { log } = require('./handlers/logger');

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
  await connect(process.env.MONGO_LINK, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  }).catch(error => console.log(error))
  client.login(process.env.DISCORD_TOKEN)
})()

connection.once('open', () => {
  log('Connected to MongoDB!', 'success')
})

connection.on('error', console.error.bind(console, 'MongoDB Connection Error:'))
