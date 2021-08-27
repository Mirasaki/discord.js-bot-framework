const { MessageEmbed, MessageSelectMenu, MessageActionRow, MessageButton } = require('discord.js');
const { permLevels } = require('../../handlers/permissions');
const Command = require('../../classes/Command');

module.exports = new Command(({ client, interaction, guildSettings, args, emojis }) => {
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
        ),
      new MessageActionRow()
        .addComponents(
          new MessageButton({
            label: 'Stop',
            customId: 'enable_02',
            style: 'DANGER',
            emoji: '🚫'
          })
        )
    ]
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
  },
  listeners: [
    {
      customId: 'enable_01',
      onClick: async function (client, interaction, guildSettings) {
        const { values, member, guild } = interaction;
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
          return interaction.update({
            content: `${client.json.emojis.response.error} No commands are currently disabled!`,
            embeds: [getEmbed(client, guild, guildSettings)],
            components: []
          });
        }

        interaction.update({
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
              ),
            new MessageActionRow()
              .addComponents(
                new MessageButton({
                  label: 'Stop',
                  customId: 'enable_02',
                  style: 'DANGER',
                  emoji: '🚫'
                })
              )
          ]
        });
      }
    },
    {
      customId: 'enable_02',
      onClick: async function (client, interaction, guildSettings) {
        interaction.update({
          content: `${client.json.emojis.response.error} This **/**enable menu has closed`,
          embeds: [getEmbed(client, interaction.guild, guildSettings)],
          components: []
        });
      }
    }
  ]
});

const getEmbed = (client, guild, settings) => {
  return new MessageEmbed()
    .setColor(client.json.colors.main)
    .setAuthor(`All disabled commands for ${guild.name}`, guild.iconURL({ dynamic: true }))
    .setDescription(`${
      settings.disabledCmds[0]
        ? `\`${settings.disabledCmds.join('`, `')}\``
        : `${client.json.emojis.response.error} None!`
    }`);
};
