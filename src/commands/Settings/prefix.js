const { MessageEmbed } = require('discord.js')

exports.run = async ({ client, message, guildSettings, args: [action, ...prefix] }) => {
  const { channel, member, guild } = message
  const prefixes = guildSettings.prefixes
  const check = prefixes.find(e => e === prefix.join(' '))
  switch (action) {
    case 'view':
      channel.send({
        embeds: [
          new MessageEmbed()
            .setColor(client.json.colors.invisible)
            .setAuthor(`Available prefixes for ${guild.name}`)
            .setDescription(`<@!${client.user.id}> - \`${prefixes.join('` - `')}\``)
        ]
      })
      break

    case 'add':
      if (prefixes.length >= 10) return channel.send(`${member}, you have reached your limit of \`10\` prefixes`)
      if (!prefix) return channel.send(`${member}, provide the prefix to add!`)
      if (prefix.length > 30) return channel.send(`${member}, a prefix can be a maximum of \`30\` characters, you provided \`${prefix.length}\` characters.`)
      if (check) return channel.send(`${member}, that prefix has already been registered!`)
      prefixes.push(prefix.join(' '))
      await guildSettings.save()
      await channel.send(`${member}, \`${prefix.join(' ')}\` is now a prefix!`)
      client.commands.get('prefix').run({ client, message, guildSettings, args: ['view'] })
      break

    case 'delete':
      if (!prefix) return channel.send(`${member}, provide the prefix to remove!`)
      if (!check) return channel.send(`${member}, that's not a usable prefix!`)
      prefixes.splice(prefixes.indexOf(check), 1)
      await guildSettings.save()
      await channel.send(`${member}, \`${prefix.join(' ')}\` has been removed as a usable prefix!`)
      client.commands.get('prefix').run({ client, message, guildSettings, args: ['view'] })
      break
  }
}

exports.config = {
  enabled: true,
  required: true,
  aliases: ['pre', 'pr'],
  permLevel: 'Administrator',
  clientPermissions: [],
  userPermissions: [],
  throttling: {
    usages: 1,
    duration: 5
  }
}

exports.help = {
  shortDescription: 'Change your server\'s prefix.',
  longDescription: 'Change your server\'s prefix.',
  usage: '<command> <add/delete>',
  examples: []
}

exports.args = {
  required: [
    {
      name: 'action',
      index: 0,
      flexible: false,
      options: ['add', 'delete', 'view']
    }
  ],
  optional: [
    {
      name: 'prefix',
      index: 1,
      flexible: true,
      options: ['Any prefix']
    }
  ]
}

exports.slash = {
  enabled: true,
  reload: true,
  globalCommand: false,
  testCommand: true,
  serverIds: [],
  options: []
}
