const specialPermissions = {
  // Bot Support
  support: [],
  // Bot Administrators
  admins: [],
  // Bot Developers
  developers: [
    '290182686365188096'
  ]
}

module.exports = [
  {
    level: 0,
    name: 'User',
    hasLevel: () => true
  },

  {
    level: 1,
    name: 'Administrator',
    hasLevel: (member, channel) => channel.permissionsFor(member.user.id) && channel.permissionsFor(member.id).has('ADMINISTRATOR')
  },

  {
    level: 2,
    name: 'Server Owner',
    hasLevel: (member, channel) => channel.guild.ownerId === member.user.id
  },

  {
    level: 3,
    name: 'Bot Support',
    hasLevel: (member) => specialPermissions.support.includes(member.user.id)
  },

  {
    level: 4,
    name: 'Bot Administrator',
    hasLevel: (member) => specialPermissions.admins.includes(member.user.id)
  },

  {
    level: 5,
    name: 'Developer',
    hasLevel: (member) => specialPermissions.developers.includes(member.user.id)
  },

  {
    level: 6,
    name: 'Bot Owner',
    hasLevel: (member) => process.env.OWNER_ID === member.user.id
  }
]
