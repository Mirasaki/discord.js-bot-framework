module.exports = (client, interaction, guildSettings) => {
  if (!interaction.message.interaction) {
    return interaction.update({
      content: `${client.json.emojis.response.error} This Button has expired!`,
      ephemeral: true,
      components: []
    })
  }

  if (interaction.message.interaction.user.id !== interaction.user.id) {
    return interaction.reply({
      content: `${client.json.emojis.response.error} You don't have access to this button!`,
      ephemeral: true
    })
  }

  const { customId } = interaction

  const command = client.commands.get(interaction.message.interaction.commandName)
  if (!command) {
    console.log('Invalid componentInteraction command!\n\nWhen deleting a command from your bot, make sure to reload it once more with \'disabled\' set to true; this will delete all slash commands created from this file')
    return interaction.update({
      content: `${client.json.emojis.response.error} That command has been disabled, and this Button has expired.`,
      ephemeral: true,
      components: []
    })
  }
  const listener = command.slash.listeners.find(e => e.customId === customId)
  if (!listener) throw new Error(`ComponentInteractionError:\nInvalid component listener/customId!\nRequested listeners: ${customId}\nOriginated from: ${command.slash.name}`)
  listener.onClick(client, interaction, guildSettings)
}
