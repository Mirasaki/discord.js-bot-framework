// const { updateSettingsDatabase } = require('../../database/helpers/settings');

exports.run = async ({ client, message }) => {
  client.send('yes', message, 'success!')
  client.send('wait', message, 'working!')
  client.send('no', message, 'failed!')
  client.send('test', message, 'error!')

  // updateSettingsDatabase();
}

exports.config = {
  enabled: true,
  required: false,
  aliases: [],
  permLevel: 'Developer',
  cooldown: 23,
  clientPermissions: [],
  userPermissions: []
}

exports.help = {
  name: 'yep',
  category: 'YEP',
  shortDescription: 'Test functionality with this command.',
  longDescription: 'Test functionality with this command. For the testing of smaller things and bits of code, consider using the eval command.',
  usage: '<command>',
  examples: []
}

exports.slash = {
  enabled: false,
  reload: true,
  globalCommand: true,
  testCommand: true,
  serverIds: [
    '826763767437459516', // BPS
    '819994671929360414', // A Server the client isn't in
    '793894728847720468' // Support Server
  ]
}
