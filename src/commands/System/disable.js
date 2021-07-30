const { MessageEmbed, MessageSelectMenu, MessageActionRow, MessageButton } = require('discord.js')
const { permLevels } = require('../../handlers/permissions')

exports.run = async ({ client, interaction, guildSettings, args }) => {
  const { member, guild } = interaction
  const disabledCommands = guildSettings.disabledCmds

  const options = []
  client.commands.filter((cmd) =>
    member.perms.permissionLevel >= permLevels[cmd.config.permLevel]
    &&
    cmd.config.required === false
    &&
    !disabledCommands.find(e => e === cmd.slash.name)
  ).forEach((cmd) => {
    options.push({
      label: cmd.slash.name,
      description: cmd.slash.description.length > 50 ? cmd.slash.description.slice(0, 46) + '...' : cmd.slash.description,
      value: cmd.slash.name
    })
  })

  if (!options[0]) {
    return interaction.reply({
      content: 'You\'ve disabled all the commands that **can** be disabled, re-enable some with **/**enable!',
      embeds: [getEmbed(client, guild, guildSettings)],
      ephemeral: true
    })
  }

  interaction.reply({
    embeds: [getEmbed(client, guild, guildSettings)],
    components: [
      new MessageActionRow()
        .addComponents(
          new MessageSelectMenu({
            customId: 'disable_01',
            placeholder: 'Select the commands to disable',
            minValues: 1,
            options
          })
        ),
      new MessageActionRow()
        .addComponents(
          new MessageButton({
            label: 'Stop',
            customId: 'disable_02',
            style: 'DANGER',
            emoji: '🚫'
          })
        )
    ]
  })
}

const getEmbed = (client, guild, settings) => {
  return new MessageEmbed()
    .setColor(client.json.colors.main)
    .setAuthor(`All disabled commands for ${guild.name}`, guild.iconURL({ dynamic: true }))
    .setDescription(`${
      settings.disabledCmds[0]
      ? `\`${settings.disabledCmds.join('`, `')}\``
      : 'None!'
    }`)
}

exports.config = {
  enabled: true,
  required: true,
  permLevel: 'Administrator',
  clientPermissions: [],
  userPermissions: [],
  throttling: {
    usages: 2,
    duration: 5
  }
}

exports.slash = {
  description: 'Disable specific commands. This only applies to the server the command is called in.',
  enabled: true,
  reload: true,
  globalCommand: false,
  testCommand: true,
  serverIds: [],
  options: [],
  listeners: [
    {
      customId: 'disable_01',
      onClick: async function (client, interaction, guildSettings) {
        const { values, guild, member } = interaction
        const { disabledCmds } = guildSettings
        values.forEach((cmdName) => disabledCmds.push(cmdName))
        await guildSettings.save()

        const options = []
        client.commands.filter((cmd) =>
          member.perms.permissionLevel >= permLevels[cmd.config.permLevel]
          &&
          cmd.config.required === false
          &&
          !disabledCmds.find(e => e === cmd.slash.name)
        ).forEach((cmd) => {
          options.push({
            label: cmd.slash.name,
            description: cmd.slash.description.length > 50 ? cmd.slash.description.slice(0, 46) + '...' : cmd.slash.description,
            value: cmd.slash.name
          })
        })

        if (!options[0]) {
          return interaction.update({
            content: 'You\'ve disabled all the commands that **can** be disabled, re-enable some with **/**enable!',
            embeds: [getEmbed(client, guild, guildSettings)],
            ephemeral: true,
            components: []
          })
        }

        interaction.update({
          content: 'Click "Stop" to cancel editing',
          embeds: [getEmbed(client, guild, guildSettings)],
          components: [
            new MessageActionRow()
              .addComponents(
                new MessageSelectMenu({
                  customId: 'disable_01',
                  placeholder: 'Select the commands to disable',
                  minValues: 1,
                  options
                })
              ),
            new MessageActionRow()
              .addComponents(
                new MessageButton({
                  label: 'Stop',
                  customId: 'disable_02',
                  style: 'DANGER',
                  emoji: '🚫'
                })
              )
          ]
        })
      }
    },
    {
      customId: 'disable_02',
      onClick: async function (client, interaction, guildSettings) {
        interaction.update({
          content: 'This **/**disable menu has closed',
          embeds: [getEmbed(client, interaction.guild, guildSettings)],
          components: []
        })
      }
    }
  ]
}
