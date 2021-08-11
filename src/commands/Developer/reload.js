const { reloadCommand } = require('../../handlers/commands')

exports.run = ({ client, interaction, guildSettings, args, emojis }) => {
  const commandName = args[0].value
  const command = client.commands.get(commandName)

  if (!command) {
    return interaction.reply({
      content: `${emojis.response.error} That is not a valid command!`,
      ephemeral: true
    })
  }

  try {
    reloadCommand(client, command)
    interaction.reply({
      content: `${emojis.response.success} Successfully reloaded **${command.slash.name}**!`
    })
  } catch (err) {
    interaction.reply({
      content: `${emojis.response.error} An error has occured while re-loading **${command.slash.name}**, click to reveal:\n\n||${err.stack || err}||`,
      ephemeral: true
    })
    console.log(err.stack || err)
  }
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
  reload: false,
  globalCommand: false,
  testCommand: true,
  serverIds: [],
  options: [
    {
      name: 'command',
      description: 'The command to reload',
      required: true,
      type: 3
    }
  ],
  listeners: [
    {
      customId: 'custom_id',
      onClick: async function (client, interaction, guildSettings) {

      }
    }
  ]
}
