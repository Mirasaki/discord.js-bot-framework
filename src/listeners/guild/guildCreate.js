const { MessageEmbed } = require('discord.js');
const { log } = require('../../handlers/logger');
const { setDefaultSlashPerms } = require('../../handlers/permissions');
const { parseSnakeCaseArray, getTimeSince } = require('../../utils/tools');
let globalCommands;

module.exports = async (client, guild) => {
  if (!guild.available) return;
  const channel = client.channels.cache.get(client.json.config.ids.serverJoinLeaveChannel);
  if (!channel || channel.type !== 'GUILD_TEXT') return;
  log(`[GUILD JOIN] ${guild.name} has added the bot! Members: ${guild.memberCount}`, 'success');

  // Send information embed to channel declared in /config/config.json
  await channel.send({
    embeds: [
      new MessageEmbed({
        description: guild.description ? guild.description : null
      })
        .setColor(client.json.colors.success)
        .setTitle(`[${guild.preferredLocale}]: ${guild.name}`)
        .setAuthor('GUILD JOIN')
        .setThumbnail(guild.iconURL({ dynamic: true }))
        .addField('Members', `${guild.memberCount}`, true)
        .addField('Discord Boost', `${parseSnakeCaseArray([guild.premiumTier])} @ ${guild.premiumSubscriptionCount} boosts`, true)
        .addField('Features', `${parseSnakeCaseArray(guild.features) || 'None!'}`, false)
        .addField('Created at', `${new Date(guild.createdAt).toLocaleString()}\n${
          getTimeSince(guild.createdAt)
        } Ago`)
    ]
  }).catch((err) => {
    log('Encountered error while trying to send [GUILD-JOIN] embed, are you using the correct ids.serverJoinLeaveChannel in your config.json?', 'error');
    console.log(err);
  });

  if (!guild.ownerId) return;
  if (!globalCommands) globalCommands = await client.application.commands.fetch();
  for (const command of globalCommands.filter((e) => {
    const clientCmd = client.commands.get(e.name);
    const permLevel = clientCmd.config.permLevel;
    return permLevel === 'Server Owner' || permLevel === 'Moderator' || permLevel === 'Administrator';
  })) await setDefaultSlashPerms(guild, command[0], [guild.ownerId]);
};
