const { getSettingsCache } = require('../../mongo/settings');
const { permConfig, checkCommandPermissions, hasChannelPerms } = require('../../handlers/permissions');
const { throttleCommand } = require('../../mongo/throttling');
const { log } = require('../../handlers/logger');
const { parseSnakeCaseArray } = require('../../utils/tools');

module.exports = async (client, interaction) => {
  if (!interaction.inGuild()) {
    return interaction.reply({
      content: `${client.json.emojis.response.error} I only listen to Slash Commands used in servers, not DM's.`,
      ephemeral: true
    });
  }
  if (
    hasChannelPerms(
      interaction.member.user.id,
      interaction.channel,
      require('../../../config/config.json').permissions.defaultRequiredPermissions
    ) !== true
  ) return;
  const { guild, user, channel } = interaction;
  let { member } = interaction;
  if (!guild || !guild.available) return;
  const guildSettings = await getSettingsCache(guild.id);
  if (!member) member = await guild.members.fetch(user.id);

  if (
    user.bot
    || !guild
    || !guild.available
    || !interaction.isCommand()
  ) return;

  const defaultPerms = hasChannelPerms(client.user.id, channel, client.json.config.permissions.defaultRequiredPermissions);
  if (defaultPerms !== true) {
    return interaction.reply({
      content: `${client.json.emojis.response.error} I lack the required channel permission${
        defaultPerms.length === 1
          ? ''
          : 's'
      }:\n\`\`\`${
        parseSnakeCaseArray(defaultPerms)
      }\`\`\``,
      ephemeral: true
    });
  }

  const args = interaction.options.data;
  const commandName = interaction.commandName;
  const cmd = client.commands.get(commandName);
  if (!cmd) {
    const guildCommands = await guild.commands.fetch();
    const check = guildCommands.find(e => e.name === commandName);
    if (check) await guild.commands.delete(check.id);
    log(`Deleted SERVER Application Command <${commandName}> for <${guild.name}>`, 'error');
    return interaction.reply({
      content: `${client.json.emojis.response.error} That command is currently disabled.`,
      ephemeral: true
    });
  }

  // Check for required permission level and required Discord Permission
  // Return if invalid
  const userPerms = await checkCommandPermissions(client, member, channel, cmd, interaction);
  if (
    typeof userPerms === 'boolean'
    && userPerms === false
  ) return;
  member.perms = userPerms;

  // Check for NSFW commands and channels
  if (cmd.config.nsfw === true && channel.nsfw !== true) {
    return interaction.reply({
      content: `${client.json.emojis.response.error} That command is marked as **NSFW**, you can't use it in a **SFW** channel!`,
      ephemeral: true
    });
  }

  // Don't apply command throttling to the highest permission level
  // We check and return for everyone else tho
  if (member.perms.permissionLevel < permConfig.sort((a, b) => a.level > b.level ? -1 : 1)[0].level) {
    const onCooldown = await throttleCommand(client, member.id, cmd);
    if (typeof onCooldown === 'string') {
      return interaction.reply({
        content: onCooldown.replace('{{user}}', `${member.toString()}`),
        ephemeral: true
      });
    }
  }

  log(`${member.user.tag} (${member.perms.permissionName}) ran command ${cmd.config.data.name}`, 'slash');
  cmd.run({
    client,
    interaction,
    guildSettings,
    args,
    emojis: client.json.emojis
  });
};