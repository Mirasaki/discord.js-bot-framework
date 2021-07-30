const { getSettingsCache } = require('../src/mongo/settings')
const config = require('../config/config.json')

const specialPermissions = {
  support: [],
  admins: [],
  developers: []
}

module.exports = [
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
      if (
        (
          channel.permissionsFor(member.id)
          && channel.permissionsFor(member.id).has(['KICK_MEMBERS', 'BAN_MEMBERS'])
        ) || (
          modRole
          && ((
            member.roles && member.roles.cache.has(modRole.id)
          ) || (
            member._roles && member._roles.includes(modRole.id))
          )
        )
      ) return true
      return false
    }
  },

  {
    level: 2,
    name: 'Administrator',
    hasLevel: async (member, channel) => {
      const { guild } = member
      const guildSettings = await getSettingsCache(guild.id)
      const adminRole = guild.roles.cache.get(guildSettings.permissions.adminRole)
      if (
        (
          channel.permissionsFor(member.id)
          && channel.permissionsFor(member.id).has('ADMINISTRATOR')
        ) || (
          adminRole
          && ((
            member.roles && member.roles.cache.has(adminRole.id)
          ) || (
            member._roles && member._roles.includes(adminRole.id))
          )
        )
      ) return true
      return false
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
    hasLevel: (member) => specialPermissions.support.includes(member.user.id)
  },

  {
    level: 5,
    name: 'Bot Administrator',
    hasLevel: (member) => specialPermissions.admins.includes(member.user.id)
  },

  {
    level: 6,
    name: 'Developer',
    hasLevel: (member) => specialPermissions.developers.includes(member.user.id)
  },

  {
    level: 7,
    name: 'Bot Owner',
    hasLevel: (member) => config.ids.owner === member.user.id
  }
]
