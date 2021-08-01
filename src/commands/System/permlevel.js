const { MessageEmbed } = require('discord.js')

exports.run = async ({ client, interaction, guildSettings, args }) => {
  const { member } = interaction
  const { permissionLevel, permissionName } = member.perms
  interaction.reply({
    embeds: [
      new MessageEmbed()
        .setColor('WHITE')
        .setDescription(`${member.toString()}, your permission level is: __${permissionLevel}__ - **${permissionName}**`)
    ]
  })
}

exports.config = {
  enabled: true,
  required: false,
  permLevel: 'User',
  clientPermissions: ['EMBED_LINKS'],
  userPermissions: []
}

exports.slash = {
  description: 'Tells you your permission level for executing bot commands.',
  enabled: true,
  reload: true,
  globalCommand: false,
  testCommand: true,
  serverIds: [],
  options: []
}
