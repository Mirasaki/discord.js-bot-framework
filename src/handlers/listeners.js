const { getFiles } = require('../utils/tools');
const nodePath = require('path');
const { log } = require('./logger');

module.exports.initializeListeners = (client) => {
  const loadedListeners = [];
  for (let path of getFiles(nodePath.join('src', 'listeners'), '.js')) {
    path = path.replaceAll(nodePath.sep, '/');
    const event = require(path);
    const eventName = path.slice(path.lastIndexOf('/') + 1, path.length - 3);
    const check = loadedListeners.find((e) => e.name === eventName);
    const thisObj = { name: eventName, origin: path };
    if (!this.validEvents.includes(eventName)) throw new TypeError(`Invalid Event name provided at ${path}!`);
    if (check) throw new Error(`Duplicate Event: ${eventName} already loaded/bound!\nOriginal event: ${check.origin}\nRequested event: ${path}`);
    loadedListeners.push(thisObj);
    client.on(eventName, (...received) => event(client, ...received));
  }
  console.log();
  log(`Successfully initialized listeners: [${loadedListeners.map(listener => listener.name).join(', ')}]`, 'success');
  console.log();
};

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
  'webhookUpdate'
];
