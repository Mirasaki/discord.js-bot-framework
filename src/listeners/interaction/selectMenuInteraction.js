module.exports = async (client, interaction, guildSettings) => {
  if (!interaction.message.interaction) {
    return interaction.update({
      content: 'This Select Menu has expired',
      ephemeral: true,
      components: []
    })
  }

  if (interaction.message.interaction.user.id !== interaction.user.id) {
    return interaction.reply({
      content: 'You don\'t have access to this Select Menu',
      ephemeral: true
    })
  }

  const { customId } = interaction

  const command = client.commands.get(interaction.message.interaction.commandName)
  if (!command) {
    console.log('Invalid selectMenuInteraction command!\n\nWhen deleting a command from your bot, make sure to reload it once more with \'disabled\' set to true; this will delete all slash commands created from this file')
    interaction.update({
      content: 'This command has been disabled, select menu has expired.',
      ephemeral: true,
      components: []
    })
  }
  const listener = command.slash.listeners.find(e => e.customId === customId)
  if (!listener) throw new Error(`selectMenuInteractionError:\nInvalid select menu listener/customId!\nRequested listeners: ${customId}\nOriginated from: ${command.slash.name}`)
  listener.onClick(client, interaction, guildSettings)
}
