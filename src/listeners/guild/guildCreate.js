const { MessageEmbed } = require('discord.js');
const { logger } = require('../../handlers/logger');
const { parseSnakeCaseArray, getTimeSince } = require('../../utils/tools');

module.exports = async (client, guild) => {
  if (!guild.available) return;
  const channel = client.channels.cache.get(client.json.config.ids.serverJoinLeaveChannel);
  if (!channel || channel.type !== 'GUILD_TEXT') return;
  logger.info(`[GUILD JOIN] ${guild.name} has added the bot! Members: ${guild.memberCount}`);
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
  });
};
