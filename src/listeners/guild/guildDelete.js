const { MessageEmbed } = require('discord.js');
const { log } = require('../../handlers/logger');
const { getSettingsCache, settingsCache } = require('../../mongo/settings');
const { parseSnakeCaseArray, getRelativeTime } = require('../../utils/tools');

module.exports = async (client, guild) => {
  if (!guild.available) return;
  const channel = client.channels.cache.get(process.env.JOIN_LEAVE_CHANNEL_ID);
  if (!channel || channel.type !== 'GUILD_TEXT') return;
  log(`[GUILD REMOVE] ${guild.name} has removed the bot! Members: ${guild.memberCount}`, 'info');
  await channel.send({
    embeds: [
      new MessageEmbed({
        description: guild.description ? guild.description : null
      })
        .setColor(client.json.colors.error)
        .setTitle(`[${guild.preferredLocale}]: ${guild.name}`)
        .setAuthor('GUILD REMOVE')
        .setThumbnail(guild.iconURL({ dynamic: true }))
        .addField('Members', `${guild.memberCount}`, true)
        .addField('Discord Boost', `${parseSnakeCaseArray([guild.premiumTier])} @ ${guild.premiumSubscriptionCount} boosts`, true)
        .addField('Features', `${parseSnakeCaseArray(guild.features) || 'None!'}`, false)
        .addField('Created at', `${new Date(guild.createdAt).toLocaleString()}\n${
          getRelativeTime(guild.createdAt)
        }`, true)
        .addField('Joined at', `${new Date(guild.joinedAt).toLocaleString()}\n${
          getRelativeTime(guild.joinedAt)
        }`, true)
    ]
  });
  const settings = getSettingsCache(guild.id);
  await settings.delete();
  settingsCache.delete(guild.id);
};
