// https://discord.com/developers/docs/topics/permissions
const { parseSnakeCaseArray } = require('../tools')

const permConfig = require('../../config/permissionLevels')
const permLevels = {}
for (let i = 0; i < permConfig.length; i++) {
  const thisLevel = permConfig[i]
  permLevels[thisLevel.name] = thisLevel.level
}
module.exports.permConfig = permConfig
module.exports.permLevels = permLevels

module.exports.getPermissionLevel = async (member, channel) => {
  const correctOrder = permConfig.sort((a, b) => a.level > b.level ? -1 : 1)
  for (const currentLevel of correctOrder) {
    if (await currentLevel.hasLevel(member, channel)) {
      return {
        permissionLevel: currentLevel.level,
        permissionName: currentLevel.name
      }
    }
  }
}

module.exports.checkCommandPermissions = async (client, member, channel, cmd, interaction) => {
  const clientId = client.user.id
  const userId = member.user.id
  const userPermLevel = await this.getPermissionLevel(member, channel)
  const { permissionName, permissionLevel } = userPermLevel
  const embed = {
    color: 'RED',
    title: `There was a problem while using "${cmd.slash.name}"`,
    fields: []
  }

  // Check for required command permission level
  if (
    permLevels[cmd.config.permLevel]
    > permissionLevel
  ) {
    embed.description = `${member}, you don't have the required permission level to use this command.
    \nRequired permission level: __${permLevels[cmd.config.permLevel]}__ - **${
      cmd.config.permLevel
    }**\nYour permission level: __${permissionLevel}__ - **${
      permissionName
    }**`
    interaction.reply({
      embeds: [embed],
      ephemeral: true
    })
    return false
  }

  // Checking for required client permissions
  const clientPerms = { required: cmd.config.clientPermissions, missing: [] }
  if (
    clientPerms.required.length >= 1
    && !this.hasChannelPerm(clientId, channel, 'ADMINISTRATOR')
  ) for (const perm of clientPerms.required) if (!this.hasChannelPerm(clientId, channel, perm)) clientPerms.missing.push(perm)

  // Checking for (optional) additional required user permissions
  const userPerms = { required: cmd.config.userPermissions, missing: [] }
  if (
    userPerms.required.length >= 1
    && !this.hasChannelPerm(userId, channel, 'ADMINISTRATOR')
  ) for (const perm of userPerms.required) if (!this.hasChannelPerm(userId, channel, perm)) userPerms.missing.push(perm)

  const valid = userPerms.missing.length < 1 && clientPerms.missing.length < 1

  if (!valid) {
    if (clientPerms.missing.length >= 1) {
      const { missing } = clientPerms
      embed.fields.push({
        name: `I lack the required permission${missing.length === 1 ? '' : 's'}:`,
        value: `${parseSnakeCaseArray(missing)}`,
        inline: true
      })
    }
    if (userPerms.missing.length >= 1) {
      const { missing } = userPerms
      embed.fields.push({
        name: `You lack the required permission${missing.length === 1 ? '' : 's'}:`,
        value: `${parseSnakeCaseArray(missing)}`,
        inline: true
      })
    }
    interaction.editReply({
      embeds: [embed],
      ephemeral: true
    })
    return false
  } else return userPermLevel
}

// Defined client & user permissions are validated
// when loading/registering the command
module.exports.validatePermissions = (permissions) => {
  const invalidPerms = []
  for (const permission of permissions) if (!validPermissions.includes(permission)) invalidPerms.push(permission)
  return invalidPerms
}

module.exports.hasChannelPerm = (userId, channel, perm) => {
  if (!validPermissions.includes(perm)) throw new TypeError('Invalid discord permission provided')
  return channel.permissionsFor(userId) && channel.permissionsFor(userId).has(perm)
}

const validPermissions = [
  'ADMINISTRATOR',
  'CREATE_INSTANT_INVITE',
  'KICK_MEMBERS',
  'BAN_MEMBERS',
  'MANAGE_CHANNELS',
  'MANAGE_GUILD',
  'ADD_REACTIONS',
  'VIEW_AUDIT_LOG',
  'PRIORITY_SPEAKER',
  'STREAM',
  'VIEW_CHANNEL',
  'SEND_MESSAGES',
  'SEND_TTS_MESSAGES',
  'MANAGE_MESSAGES',
  'EMBED_LINKS',
  'ATTACH_FILES',
  'READ_MESSAGE_HISTORY',
  'MENTION_EVERYONE',
  'USE_EXTERNAL_EMOJIS',
  'USE_EXTERNAL_STICKERS',
  'VIEW_GUILD_INSIGHTS',
  'CONNECT',
  'SPEAK',
  'MUTE_MEMBERS',
  'DEAFEN_MEMBERS',
  'MOVE_MEMBERS',
  'USE_VAD',
  'CHANGE_NICKNAME',
  'MANAGE_NICKNAMES',
  'MANAGE_ROLES',
  'MANAGE_WEBHOOKS',
  'MANAGE_EMOJIS_AND_STICKERS',
  'USE_SLASH_COMMANDS',
  'REQUEST_TO_SPEAK',
  'MANAGE_THREADS',
  'USE_PUBLIC_THREADS',
  'USE_PRIVATE_THREADS'
]
