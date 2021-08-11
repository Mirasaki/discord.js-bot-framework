const { getFiles } = require('../utils/tools')

module.exports.initializeListeners = (client, counter = 0) => {
  const loadedListeners = []
  console.log('Initializing listeners:')
  for (let path of getFiles(process.env.EVENTS_PATH, '.js')) {
    path = path.replace(/\\/g, '/')
    const event = require(path)
    const eventName = path.slice(path.lastIndexOf('/') + 1, path.length - 3)
    const check = loadedListeners.find((e) => e.name === eventName)
    const thisObj = { name: eventName, origin: path }
    if (!this.validEvents.includes(eventName)) throw new TypeError(`Invalid Event name provided at ${path}!`)
    if (check) throw new Error(`Duplicate Event: ${eventName} already loaded/bound!\nOriginal event: ${check.origin}\nRequested event: ${path}`)
    counter++
    loadedListeners.push(thisObj)
    client.on(eventName, (...received) => event(client, ...received))
    console.log(`    ${loadedListeners.indexOf(thisObj) + 1} ${eventName}: ${
      thisObj.origin.slice(
        thisObj.origin
        .indexOf(process.env.EVENTS_PATH
      ), thisObj.origin.length
    )}`)
  }
  console.log('Finished initializing listeners!\n')
}

module.exports.validEvents = [
  'applicationCommandCreate',
  'applicationCommandDelete',
  'applicationCommandUpdate',
  'channelCreate',
  'channelDelete',
  'channelPinsUpdate',
  'channelUpdate',
  'debug',
  'emojicreate',
  'emojiDelete',
  'emojiUpdate',
  'error',
  'guildBanAdd',
  'guildBanRemove',
  'guildCreate',
  'guildDelete',
  'guildIntegrationsUpdate',
  'guildMemberAdd',
  'guildMemberAvailable',
  'guildMemberRemove',
  'guildMembersChunk',
  'guildMemberUpdate',
  'guildUnavailable',
  'guildUpdate',
  'interaction', // Deprecated
  'interactionCreate',
  'invalidated',
  'invalidRequestWarning',
  'inviteCreate',
  'inviteDelete',
  'message', // Deprecated
  'messageCreate',
  'messageDelete',
  'messageDeleteBulk',
  'messageReactionAdd',
  'messageReactionRemove',
  'messageReactionRemoveAll',
  'messageReactionRemoveEmoji',
  'messageUpdate',
  'presenceUpdate',
  'rateLimit',
  'ready',
  'roleCreate',
  'roleDelete',
  'roleUpdate',
  'shardDisconnect',
  'shardError',
  'shardReady',
  'shardReconnecting',
  'shardResume',
  'stageInstanceCreate',
  'stageInstanceDelete',
  'stageInstanceUpdate',
  'stickerCreate',
  'stickerDelete',
  'stickerUpdate',
  'threadCreate',
  'threadDelete',
  'threadListSync',
  'threadMembersUpdate',
  'threadMemberUpdate',
  'threadUpdate',
  'typingStart',
  'userUpdate',
  'voiceStateUpdate',
  'warn',
  'webhookUpdate',

  /*
    CUSTOM (non-discord.js)
    LISTENERS
  */

  'commandInteraction',
  'componentInteraction',
  'selectMenuInteraction'
]
