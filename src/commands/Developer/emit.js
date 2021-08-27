const { validEvents } = require('../../handlers/listeners');
const Command = require('../../classes/Command');

const eventsData = [];
validEvents.filter((event) => (
  !event.match(/messageReaction|interaction|application|channelPins/)
)).forEach((event) => {
  eventsData.push({
    name: event.toLowerCase(),
    value: event
  });
});

module.exports = new Command(({ client, interaction, guildSettings, args, emojis }) => {
  if (!args[0]) {
    return interaction.reply({
      content: `${emojis.response.error} Include one of the available events!`,
      ephemeral: true
    });
  }

  const { channel, guild, member, user } = interaction;
  const role = member.roles.cache.random() || null;
  const event = args[0].value;

  const getObj = (str) => {
    switch (str) {
      case 'channel': return channel;
      case 'guild': return guild;
      case 'member': return member;
      case 'user': return user;
      case 'role': return role;
      default: break;
    }
  };

  client.emit(event, getObj(args[0]), getObj(args[1]), getObj(args[2]));
  interaction.reply({
    content: `${emojis.response.success} Successfully emitted ${event}`,
    ephemeral: true
  });
}, {
  enabled: true,
  required: false,
  permLevel: 'Bot Administrator',
  clientPermissions: [],
  userPermissions: [],
  globalCommand: false,
  testCommand: true,
  serverIds: [],
  data: {
    description: 'Emit a discord.js event to the client',
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
});
