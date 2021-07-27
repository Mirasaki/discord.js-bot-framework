const { checkAndExecuteIfPass, hasChannelPerm } = require('../../handlers/permissions')

module.exports = async (client, message) => {
  const prefix = '~'
  const { content, member, guild, author, channel } = message

  if (
    !content.startsWith(prefix)
    || author.bot
    || !guild
    || !guild.available
    || !hasChannelPerm(member.user.id, channel, 'SEND_MESSAGES')
  ) return

  // split at any amount of repeating spaces or \u200b
  const args = content.slice(prefix.length).split(/ +/)
  const commandName = args.shift().toLowerCase()
  if (!member) message.member = await guild.members.fetch(author)
  const command = client.commands.get(commandName) || client.commands.get(client.aliases.get(commandName))
  if (command) checkAndExecuteIfPass(client, message, command)
}
