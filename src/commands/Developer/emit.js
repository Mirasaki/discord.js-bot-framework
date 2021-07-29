const { validEvents } = require('../../handlers/listeners')

exports.run = ({ client, message, guildSettings, args }) => {
  const { channel, guild, member, user } = message
  const role = member.roles.cache.random() || null
  const event = args.shift()

  const getObj = (str) => {
    switch (str) {
      case 'channel': return channel
      case 'guild': return guild
      case 'member': return member
      case 'user': return user
      case 'role': return role
    }
  }

  client.emit(event, getObj(args[0]), getObj(args[1]), getObj(args[2]))
}

exports.config = {
  enabled: true,
  required: false,
  aliases: [],
  permLevel: 'Developer',
  clientPermissions: [],
  userPermissions: [],
  throttling: {
    usages: 1,
    duration: 5
  }
}

exports.help = {
  shortDescription: 'Emit a discord.js event to the client',
  longDescription: 'Emit a discord.js event to the client',
  usage: '<command> <event>',
  examples: [
    'emit guildCreate'
  ]
}

exports.args = {
  required: [
    {
      name: 'event',
      index: 0,
      flexible: false,
      options: validEvents.filter((event) => (
        !event.match(/messageReaction|interaction|application|channelPins/)
      ))
    },
    {
      name: 'options',
      index: 1,
      flexible: false,
      options: [
        'channel',
        'guild',
        'member',
        'message',
        'role',
        'user'
      ]
    }
  ],
  optional: []
}

const eventsData = []
validEvents.filter((event) => (
  !event.match(/messageReaction|interaction|application|channelPins/)
)).forEach((event) => {
  eventsData.push({
    name: event.toLowerCase(),
    value: event
  })
})

exports.slash = {
  enabled: true,
  reload: true,
  globalCommand: false,
  testCommand: true,
  serverIds: [],
  options: [
    {
      name: 'a-i',
      description: 'Events (A-I) to emit to the client',
      type: 3,
      choices: eventsData.slice(0, 24)
    },
    {
      name: 'j-t',
      description: 'Events (J-T) to emit to the client',
      type: 3,
      choices: eventsData.slice(25, 49)
    },
    {
      name: 'u-z',
      description: 'Events (U-Z) to emit to the client',
      type: 3,
      choices: eventsData.slice(50, eventsData.length)
    }
  ]
}
