const { MessageEmbed, MessageSelectMenu, MessageActionRow } = require('discord.js');
const { permLevels } = require('../../handlers/permissions');
const Command = require('../../classes/Command');
const calledRecently = new Set();

module.exports = new Command(async ({ client, interaction, guildSettings, args, emojis }) => {
  if (calledRecently.has(interaction.channel.id)) {
    return interaction.reply({
      content: `${emojis.response.error} ${interaction.member.toString()}, \`${interaction.commandName}\` is already active in **#${interaction.channel.name}**, please try again later.`,
      ephemeral:  true
    });
  } else calledRecently.add(interaction.channel.id);
  const { member, guild } = interaction;
  const disabledCommands = guildSettings.disabledCmds;

  const options = [];
  client.commands.filter((cmd) =>
    member.perms.permissionLevel >= permLevels[cmd.config.permLevel]
    &&
    cmd.config.required === false
    &&
    disabledCommands.find(e => e === cmd.config.data.name)
  ).forEach((cmd) => {
    options.push({
      label: cmd.config.data.name,
      description: cmd.config.data.description.length > 50 ? cmd.config.data.description.slice(0, 46) + '...' : cmd.config.data.description,
      value: cmd.config.data.name
    });
  });

  if (!options[0]) {
    return interaction.reply({
      content: `${emojis.response.error} No commands are currently disabled!`
    });
  }

  interaction.reply({
    embeds: [getEmbed(client, guild, guildSettings)],
    components: [
      new MessageActionRow()
        .addComponents(
          new MessageSelectMenu({
            customId: 'enable_01',
            placeholder: 'Select the commands to enable',
            minValues: 1,
            options
          })
        )
    ]
  });

  const filter = i => i.customId === 'enable_01' && i.user.id === interaction.user.id;
  const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000, max: 1 });
  collector.on('collect', async i => {
    const { values, member, guild } = i;
    const { disabledCmds } = guildSettings;
    values
      .filter((cmdName) => disabledCmds.includes(cmdName))
      .forEach((cmdName) => disabledCmds.splice(disabledCmds.indexOf(cmdName), 1));
    await guildSettings.save();
    const options = [];
    client.commands.filter((cmd) =>
      member.perms.permissionLevel >= permLevels[cmd.config.permLevel]
        &&
        cmd.config.required === false
        &&
        disabledCmds.find(e => e === cmd.config.data.name)
    ).forEach((cmd) => {
      options.push({
        label: cmd.config.data.name,
        description: cmd.config.data.description.length > 50 ? cmd.config.data.description.slice(0, 46) + '...' : cmd.config.data.description,
        value: cmd.config.data.name
      });
    });

    if (!options[0]) {
      return i.update({
        content: `${client.json.emojis.response.error} No commands are currently disabled!`,
        embeds: [getEmbed(client, guild, guildSettings)],
        components: []
      });
    }

    i.update({
      embeds: [getEmbed(client, guild, guildSettings)],
      components: [
        new MessageActionRow()
          .addComponents(
            new MessageSelectMenu({
              customId: 'enable_01',
              placeholder: 'Select the commands to enable',
              minValues: 1,
              options,
              disabled: true
            })
          )
      ]
    });
  });
  collector.on('end', () => {
    calledRecently.delete(interaction.channel.id);
  });
}, {
  required: true,
  permLevel: 'Administrator',
  clientPermissions: ['EMBED_LINKS'],
  throttling: {
    usages: 1,
    duration: 10
  },
  globalCommand: true,
  testCommand: false,
  data: {
    description: 'Enable previously disabled commands. This only applies to the server the command is called in.',
  }
});

const getEmbed = (client, guild, settings) => {
  return new MessageEmbed()
    .setColor(client.json.colors.main)
    .setAuthor(`All disabled commands for ${guild.name}`, guild.iconURL({ dynamic: true }))
    .setDescription(`${
      settings.disabledCmds[0]
        ? `\`${settings.disabledCmds.join('`, `')}\``
        : 'None!'
    }`);
};
