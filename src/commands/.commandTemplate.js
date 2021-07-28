exports.run = ({ client, message, guildSettings, args }) => {
  //
}

exports.config = {
  enabled: null,
  required: null,
  aliases: [],
  permLevel: '',
  clientPermissions: [],
  userPermissions: [],
  throttling: {
    usages: 1,
    duration: 5
  }
}

exports.help = {
  name: '',
  category: '',
  shortDescription: '',
  longDescription: '',
  usage: '<command>',
  examples: []
}

exports.slash = {
  enabled: true,
  reload: true,
  globalCommand: false,
  testCommand: true,
  serverIds: [],
  options: []
}
