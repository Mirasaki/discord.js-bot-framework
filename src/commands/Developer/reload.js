exports.run = ({ client, interaction, guildSettings, args }) => {
  //
}

exports.config = {
  enabled: true,
  required: true,
  permLevel: 'Developer',
  clientPermissions: [],
  userPermissions: [],
  throttling: {
    usages: 1,
    duration: 5
  }
}

exports.slash = {
  description: 'Reload a command',
  enabled: true,
  reload: true,
  globalCommand: false,
  testCommand: true,
  serverIds: [],
  options: [],
  listeners: [
    {
      customId: 'custom_id',
      onClick: async function (client, interaction, guildSettings) {

      }
    }
  ]
}
