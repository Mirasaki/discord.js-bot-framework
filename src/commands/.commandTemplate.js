exports.run = ({ client, interaction, guildSettings, args, emojis }) => {
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
  },
  nsfw: null
}

exports.slash = {
  name: '',
  category: '',
  description: '',
  enabled: true,
  reload: false,
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
