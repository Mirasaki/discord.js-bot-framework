exports.run = ({ client, interaction, guildSettings, args, emojis }) => {
  //
};

exports.config = {
  enabled: true,
  required: true,
  permLevel: '',
  clientPermissions: [],
  userPermissions: [],
  throttling: {
    usages: 1,
    duration: 5
  },
  nsfw: false
};

exports.slash = {
  name: '',
  category: '',
  description: '',
  defaultPermission: true,
  enabled: true,
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
};
