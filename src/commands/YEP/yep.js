exports.run = async ({ client, message }) => {
  return message.channel.send({
    content: 'Yep!'
  })
}

exports.config = {
  enabled: true,
  required: false,
  permLevel: 'Developer'
}

exports.help = {
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
