const { MessageEmbed } = require('discord.js');
const { log } = require('../../handlers/logger');
const { setDefaultSlashPerms } = require('../../handlers/permissions');
const { parseSnakeCaseArray, getRelativeTime } = require('../../utils/tools');
let globalCommands;

module.exports = async (client, guild) => {
  if (!guild.available) return;
  const channel = client.channels.cache.get(process.env.JOIN_LEAVE_CHANNEL_ID);
  if (!channel || channel.type !== 'GUILD_TEXT') return;
  log(`[GUILD JOIN] ${guild.name} has added the bot! Members: ${guild.memberCount}`, 'success');

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
          getRelativeTime(guild.createdAt)
        }`)
    ]
  }).catch((err) => {
    log('Encountered error while trying to send [GUILD-JOIN] embed, are you using the correct JOIN_LEAVE_CHANNEL_ID in your /config/.env file?', 'error');
    console.log(err);
  });

  if (!guild.ownerId) return;
  globalCommands ??= await client.application.commands.fetch();
  for (const command of globalCommands.filter((e) => {
    const clientCmd = client.commands.get(e.name);
    const permLevel = clientCmd.config.permLevel;
    return permLevel === 'Server Owner' || permLevel === 'Moderator' || permLevel === 'Administrator';
  })) await setDefaultSlashPerms(guild, command[0], client.commands.get(command[1].name).config.permLevel, [guild.ownerId]);
};
