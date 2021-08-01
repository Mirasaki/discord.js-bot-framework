const { permConfig, checkCommandPermissions, hasChannelPerms } = require('../../handlers/permissions')
const { throttleCommand } = require('../../mongo/throttling')
const { log } = require('../../handlers/logger')

module.exports = async (client, interaction, guildSettings) => {
  const { member, guild, user, channel } = interaction

  if (
    user.bot
    || !guild
    || !guild.available
    // At the time of writing this, slash commands can be called
    // from a channel the client doesn't have access to
    // this will of course result in an error
    || hasChannelPerms(member.user.id, channel, ['VIEW_CHANNEL', 'SEND_MESSAGES']) !== true
  ) return

  // split at any amount of repeating spaces or \u200b
  const args = interaction.options.data
  const commandName = interaction.commandName
  const cmd = client.commands.get(commandName)
  if (!cmd) {
    return interaction.reply({
      content: '🚫 That command is currently disabled.',
      ephemeral: true
    })
  }

  // Check for required permission level and required Discord Permission
  // Return if invalid
  const userPerms = await checkCommandPermissions(client, member, channel, cmd, interaction)
  if (
    typeof userPerms === 'boolean'
    && userPerms === false
  ) return

  // Don't apply command throttling to the highest permission level
  // We check and return for everyone else tho
  if (member.perms.permissionLevel < permConfig.sort((a, b) => a.level > b.level ? -1 : 1)[0].level) {
    const onCooldown = await throttleCommand(member.id, cmd)
    if (typeof onCooldown === 'string') {
      return interaction.reply({
        content: onCooldown.replace('{{user}}', `${member.toString()}`),
        ephemeral: true
      })
    }
  }

  log(`${member.user.tag} (${member.perms.permissionName}) ran command ${cmd.slash.name}`, 'slash')
  cmd.run({
    client,
    interaction,
    guildSettings,
    args
  })
}
