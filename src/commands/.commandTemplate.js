exports.run = ({ client, interaction, guildSettings, args }) => {
  //
}

exports.config = {
  enabled: null,
  required: null,
  permLevel: '',
  clientPermissions: [],
  userPermissions: [],
  throttling: {
    usages: 1,
    duration: 5
  }
}

exports.slash = {
  name: '',
  category: '',
  description: '',
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
