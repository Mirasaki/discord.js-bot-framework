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
    hasLevel: (member, channel) => (
      channel.permissionsFor(member.user.id)
      && channel.permissionsFor(member.user.id).has(['KICK_MEMBERS', 'BAN_MEMBERS'])
    )
  },

  {
    level: 2,
    name: 'Administrator',
    hasLevel: (member, channel) => channel.permissionsFor(member.user.id) && channel.permissionsFor(member.id).has('ADMINISTRATOR')
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
    hasLevel: (member) => process.env.OWNER_ID === member.user.id
  }
]
