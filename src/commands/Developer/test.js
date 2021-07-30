const { MessageActionRow, MessageButton } = require('discord.js')

exports.run = ({ client, interaction, guildSettings, args }) => {
  interaction.reply({
    content: '✅',
    ephemeral: true,
    components: [
      new MessageActionRow()
        .addComponents(
          new MessageButton({
            label: 'Testing',
            // The defined listener in exports.slash.listeners
            // listens to "test_01" not "no_listener_for_this_id"
            // This will throw an error if clicked
            customId: 'no_listener_for_this_id',
            style: 'PRIMARY',
            emoji: '💀'
          })
        )
    ]
  })
}

exports.config = {
  enabled: true,
  required: false,
  permLevel: 'User',
  clientPermissions: ['MANAGE_CHANNELS', 'EMBED_LINKS', 'USE_EXTERNAL_EMOJIS'],
  userPermissions: ['ADMINISTRATOR', 'EMBED_LINKS', 'USE_EXTERNAL_EMOJIS'],
  throttling: {
    usages: 1,
    duration: 5
  }
}

exports.slash = {
  description: 'Test functionality with this command.',
  enabled: true,
  reload: true,
  globalCommand: false,
  testCommand: true,
  serverIds: [
    '826763767437459516', // BPS
    '819994671929360414', // A Server the client isn't in
    '793894728847720468' // Support Server
  ],
  options: [],
  listeners: [
    {
      customId: 'test_01',
      onClick: async function (client, interaction, guildSettings) {
        // Code to execute on button click
      }
    }
  ]
}
