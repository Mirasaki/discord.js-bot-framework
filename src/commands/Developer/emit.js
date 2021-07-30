const { validEvents } = require('../../handlers/listeners')

exports.run = async ({ client, interaction, guildSettings, args }) => {
  if (!args[0]) {
    return interaction.reply({
      content: 'Include one of the available events!',
      ephemeral: true
    })
  }

  const { channel, guild, member, user } = interaction
  const role = member.roles.cache.random() || null
  const event = args[0].value

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
  interaction.reply({
    content: `Successfully emitted ${event}`,
    ephemeral: true
  })
}

exports.config = {
  enabled: true,
  required: false,
  permLevel: 'Developer',
  clientPermissions: [],
  userPermissions: []
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
  description: 'Emit a discord.js event to the client',
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
      name: 't-z-custom',
      description: 'Events (T-Z & Custom) to emit to the client',
      type: 3,
      choices: eventsData.slice(50, eventsData.length)
    }
  ]
}
