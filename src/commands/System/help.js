const { MessageEmbed } = require('discord.js')
const { titleCase } = require('../../tools')
const { permLevels } = require('../../handlers/permissions')

exports.run = ({ client, interaction, guildSettings, args }) => {
  const { channel, member } = message
  const { permissionLevel } = message.member.perms

  if (!args[0]) {
    const authorCommands = client.commands.filter(cmd => permLevels[cmd.config.permLevel] <= permissionLevel).array()
    const commands = authorCommands
      .sort((a, b) => a.slash.category > b.slash.category
        ? 1
        : ((a.slash.name > b.slash.name && a.slash.category === b.slash.category)
            ? 1
            : -1))

    let embedText = ''
    let currentCategory = ''

    commands.forEach(command => {
      const workingCategory = titleCase(command.slash.category)
      if (currentCategory !== workingCategory) {
        embedText += `\n\n***__${workingCategory}__***\n`
        currentCategory = workingCategory
      }
      embedText += `\`${command.slash.name}\` `
    })
    return channel.send({
      embeds: [
        new MessageEmbed()
          .setAuthor(client.user.username, client.user.avatarURL({ dynamic: true }) || client.extras.defaultImageLink)
          .setThumbnail(message.guild.iconURL({ dynamic: true }))
          .setColor(client.json.colors.main)
          .setDescription(embedText)
          .addField('Detailed Command Information', `<@!${client.user.id}> help <any command>`)
      ]
    })
  }

  const commandName = args[0].toLowerCase()
  const command = client.commands.get(commandName)
  if (!command) {
    return channel.send({
      content: 'That\'s not a valid command!'
    })
  }
  const { help, config, slash } = command
  const { throttling } = config
  const fields = []

  if (
    permLevels[config.permLevel]
    > permissionLevel
  ) return channel.send(`${member}, you don't have permission to use that command!`)

  const helpEmbed = new MessageEmbed({ fields })
    .setColor(client.json.colors.main)
    .setAuthor(titleCase(slash.name))
    .setDescription(`${slash.description}
    \n**Category:** ${
      slash.category
    }
    **Cooldown:** ${
      throttling
      ? `${
        throttling.usages === 1
          ? '1 time'
          : `${throttling.usages} times`
        } in ${
          throttling.duration === 1
          ? '1 second'
          : `${throttling.duration} seconds`
      }`
      : 'No cooldown!'
    }
    **Slash Command:** ${
      slash && slash.enabled && slash.global ? 'Yes' : 'No'
    }
    **Can Be Disabled:** ${
      config.required ? 'Yes' : 'No'
    }
    
    **Permissions:**
    **Me:** ${
      config.clientPermissions[0]
      ? `\`${getPermString(config.clientPermissions, channel, client.user.id)}\``
      : 'None required!'
    }
    **You:** ${
      config.userPermissions[0]
      ? `\`${getPermString(config.userPermissions, channel, member.id)}\``
      : 'None required!'
    }
    `)
    .setFooter('<>: Angle bracket notation means the option is required.\n[]: Square bracket notation means the option is optional.')

  channel.send({
    embeds: [helpEmbed]
  })
}

const getPermString = (arr, channel, id) => {
  const temp = []
  arr.forEach((perm) => {
    const check = channel.permissionsFor(id) && channel.permissionsFor(id).has(perm)
    perm = perm.toLowerCase().split(/[ _]+/)
    for (let i = 0; i < perm.length; i++) perm[i] = perm[i].charAt(0).toUpperCase() + perm[i].slice(1)
    if (check) temp.push(`\`✅ ${perm.join(' ')}\``)
    else temp.push(`\`🚫 ${perm.join(' ')}\``)
  })
  return temp.join('` - `')
}

exports.config = {
  enabled: true,
  required: true,
  permLevel: 'User',
  clientPermissions: [],
  userPermissions: [],
  throttling: {
    usages: 3,
    duration: 10
  }
}

exports.slash = {
  description: 'Get an overview on all the available commands!',
  enabled: true,
  reload: true,
  globalCommand: false,
  testCommand: true,
  serverIds: [],
  options: []
}