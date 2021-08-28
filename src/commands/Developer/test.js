const { MessageActionRow, MessageButton } = require('discord.js');
const Command = require('../../classes/Command');

module.exports = new Command(({ client, interaction, guildSettings, args, emojis }) => {
  client.emit('guildCreate', (interaction.guild));
  interaction.reply({
    content: '✅',
    ephemeral: true,
    components: [
      new MessageActionRow()
        .addComponents(
          new MessageButton({
            label: 'Testing',
            customId: 'no_listener_for_this_id',
            style: 'PRIMARY',
            emoji: '💀'
          })
        )
    ]
  });
}, {
  permLevel: 'Developer',
  clientPermissions: ['MANAGE_CHANNELS', 'EMBED_LINKS', 'USE_EXTERNAL_EMOJIS'],
  userPermissions: ['ADMINISTRATOR', 'EMBED_LINKS', 'USE_EXTERNAL_EMOJIS'],
  nsfw: true,
  serverIds: [
    '826763767437459516', // BPS
    '819994671929360414', // A Server the client isn't in
    '793894728847720468' // Support Server
  ],
  data: {
    description: 'Test functsionality with this command.',
    options: [
      {
        name: 'test',
        description: 'false',
        type: 'STRING'
      }
    ],
  }
});
