const { checkHasRequiredArgs } = require('../../handlers/arguments')
const { checkAndExecuteIfPass, hasChannelPerm } = require('../../handlers/permissions')
const { getSettingsCache } = require('../../mongo/settings')

module.exports = async (client, message) => {
  let { content } = message
  const { member, guild, author, channel } = message
  const guildSettings = await getSettingsCache(guild.id)

  const prefixes = guildSettings.prefixes
  const clientTag = `<@!${client.user.id}>`
  let usedPrefix
  if (content.startsWith(clientTag)) {
    usedPrefix = `@${guild.me.displayName}`
    content = content.replace(clientTag, `@${guild.me.displayName}`)
  } else {
    for (const prefix of prefixes) {
      if (
        content.startsWith(prefix)
        || content.startsWith(`${prefix} `)
      ) {
        usedPrefix = prefix
        break
      }
    }
  }

  if (
    typeof usedPrefix === 'undefined'
    || author.bot
    || !guild
    || !guild.available
    || !hasChannelPerm(member.user.id, channel, 'SEND_MESSAGES')
  ) return

  // split at any amount of repeating spaces or \u200b
  const args = content.slice(usedPrefix.length).trim().split(/ +/)
  const commandName = args.shift().toLowerCase()
  if (!member) message.member = await guild.members.fetch(author)
  const command = client.commands.get(commandName) || client.commands.get(client.aliases.get(commandName))
  if (!command) return
  if (!checkHasRequiredArgs(`${usedPrefix} `, message, command, args)) return
  checkAndExecuteIfPass(client, message, command, guildSettings, args)
}
