// https://discord.com/developers/docs/topics/permissions
const { parseSnakeCaseArray } = require('../utils/tools')
const { Permissions } = require('discord.js')
const { getSettingsCache } = require('../mongo/settings')
const config = require('../../config/config.json')
const { stripIndents } = require('common-tags')

const permConfig = [
  {
    level: 0,
    name: 'User',
    hasLevel: () => true
  },

  {
    level: 1,
    name: 'Moderator',
    hasLevel: async (member, channel) => {
      const { guild } = member
      const guildSettings = await getSettingsCache(guild.id)
      const modRole = guild.roles.cache.get(guildSettings.permissions.modRole)
      return (
        (
          this.hasChannelPerms(member.id, channel, ['KICK_MEMBERS', 'BAN_MEMBERS']) === true
        ) || (
          modRole
          && ((
            member.roles && member.roles.cache.has(modRole.id)
          ) || (
            member._roles && member._roles.includes(modRole.id))
          )
        )
      )
    }
  },

  {
    level: 2,
    name: 'Administrator',
    hasLevel: async (member, channel) => {
      const { guild } = member
      const guildSettings = await getSettingsCache(guild.id)
      const adminRole = guild.roles.cache.get(guildSettings.permissions.adminRole)
      return (
        (
          this.hasChannelPerms(member.id, channel, 'ADMINISTRATOR') === true
        ) || (
          adminRole
          && ((
            member.roles && member.roles.cache.has(adminRole.id)
          ) || (
            member._roles && member._roles.includes(adminRole.id))
          )
        )
      )
    }
  },

  {
    level: 3,
    name: 'Server Owner',
    hasLevel: (member, channel) => channel.guild.ownerId === member.user.id
  },

  {
    level: 4,
    name: 'Bot Support',
    hasLevel: (member) => config.permissions.support.includes(member.user.id)
  },

  {
    level: 5,
    name: 'Bot Administrator',
    hasLevel: (member) => config.permissions.admins.includes(member.user.id)
  },

  {
    level: 6,
    name: 'Developer',
    hasLevel: (member) => config.permissions.developers.includes(member.user.id)
  },

  {
    level: 7,
    name: 'Bot Owner',
    hasLevel: (member) => config.permissions.owner === member.user.id
  }
]

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
    title: `${client.json.emojis.response.error} There was a problem while using "/${cmd.slash.name}" in #${channel.name}`,
    fields: []
  }

  // Check for required command permission level
  if (
    permLevels[cmd.config.permLevel]
    > permissionLevel
  ) {
    embed.description = stripIndents`${member}, you don't have the required permission level to use this command.
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

  const clientPermissions = this.hasChannelPerms(clientId, channel, cmd.config.clientPermissions)
  const userPermissions = this.hasChannelPerms(userId, channel, cmd.config.userPermissions)
  const valid = (
    (
      this.hasChannelPerms(clientId, channel, 'ADMINISTRATOR') === true
      || clientPermissions === true
    ) && (
      this.hasChannelPerms(userId, channel, 'ADMINISTRATOR') === true
      || userPermissions === true
    )
  )

  if (!valid) {
    if (clientPermissions.length >= 1) {
      embed.fields.push({
        name: `I lack the required permission${clientPermissions.length === 1 ? '' : 's'}:`,
        value: `${parseSnakeCaseArray(clientPermissions)}`,
        inline: true
      })
    }
    if (userPermissions.length >= 1) {
      embed.fields.push({
        name: `You lack the required permission${userPermissions.length === 1 ? '' : 's'}:`,
        value: `${parseSnakeCaseArray(userPermissions)}`,
        inline: true
      })
    }
    interaction.reply({
      embeds: [embed],
      ephemeral: true
    })
    return false
  } else return userPermLevel
}

module.exports.validatePermissions = (permissions) => {
  const invalidPerms = []
  for (const permission of permissions) if (!Permissions.FLAGS[permission]) invalidPerms.push(permission)
  return invalidPerms
}

module.exports.hasChannelPerms = (userId, channel, permArray) => {
  if (typeof permArray === 'string') permArray = [permArray]
  const invalidPerms = this.validatePermissions(permArray)
  if (invalidPerms[0]) throw new Error(`Invalid discord permissions were provided: ${invalidPerms}`)
  if (!channel.permissionsFor(userId)) return permArray
  const missing = permArray.filter((perm) => !channel.permissionsFor(userId).has(Permissions.FLAGS[perm]))
  if (!missing[0]) return true
  else return missing
}
