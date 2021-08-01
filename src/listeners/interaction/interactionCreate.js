const { getPermissionLevel, hasChannelPerms } = require('../../handlers/permissions')
const { getSettingsCache } = require('../../mongo/settings')
module.exports = async (client, interaction) => {
  let { member, channel, user } = interaction
  if (
    hasChannelPerms(client.user.id, interaction.channel, [
      'VIEW_CHANNEL',
      'SEND_MESSAGES'
    ]) !== true
  ) return
  const { guild } = interaction
  if (!guild || !guild.available) return
  const guildSettings = await getSettingsCache(guild.id)
  if (!member) member = await guild.members.fetch(user.id)
  const userPerms = await getPermissionLevel(member, channel)
  member.perms = userPerms

  if (interaction.isCommand()) require('./commandInteraction')(client, interaction, guildSettings)
  else if (interaction.isSelectMenu()) require('./selectMenuInteraction')(client, interaction, guildSettings)
  else if (interaction.isMessageComponent()) require('./componentInteraction')(client, interaction, guildSettings)
}
