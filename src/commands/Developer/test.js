exports.run = ({ client, message, guildSettings, args }) => {
  message.channel.send('...')
}

exports.config = {
  enabled: true,
  required: false,
  aliases: ['t'],
  permLevel: 'User',
  clientPermissions: [],
  userPermissions: [],
  throttling: {
    usages: 1,
    duration: 5
  }
}

exports.help = {
  name: 'test',
  category: 'Developer',
  shortDescription: 'Test functionality with this command.',
  longDescription: 'Test functionality with this command. For the testing of smaller things and bits of code, consider using the eval command.',
  usage: '<command>',
  examples: []
}

exports.slash = {
  enabled: true,
  reload: true,
  globalCommand: true,
  testCommand: true,
  serverIds: [
    '826763767437459516', // BPS
    '819994671929360414', // A Server the client isn't in
    '793894728847720468' // Support Server
  ],
  options: [
    {
      name: 'add',
      description: 'Add to the blacklist',
      required: false,
      type: 2,
      options: [
        {
          name: 'channel',
          description: 'Add a channel to the blacklist',
          type: 1,
          options: [
            {
              name: 'channel',
              description: 'The channel to add',
              type: 7,
              required: true
            }
          ]
        },
        {
          name: 'role',
          description: 'Add a role to the blacklist',
          type: 1,
          options: [
            {
              name: 'role',
              description: 'The role to add',
              type: 8,
              required: true
            }
          ]
        }
      ]
    },
    {
      name: 'delete',
      description: 'Remove from the blacklist',
      required: false,
      type: 2,
      options: [
        {
          name: 'channel',
          description: 'Remove a channel from the blacklist',
          type: 1,
          options: [
            {
              name: 'channel',
              description: 'The channel to remove',
              type: 7,
              required: true
            }
          ]
        },
        {
          name: 'role',
          description: 'Remove a role from the blacklist',
          type: 1,
          options: [
            {
              name: 'role',
              description: 'The role to remove',
              type: 8,
              required: true
            }
          ]
        }
      ]
    },
    {
      name: 'action',
      description: 'Other blacklist functionality',
      type: 2,
      required: false,
      options: [
        {
          name: 'reset',
          description: 'Reset the blacklist',
          type: 1
        },
        {
          name: 'view',
          description: 'View the blacklist',
          type: 1
        }
      ]
    }
  ]
}
