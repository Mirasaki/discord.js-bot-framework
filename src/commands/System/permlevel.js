const { MessageEmbed } = require('discord.js');
const Command = require('../../classes/Command');

module.exports = new Command(({ client, interaction, guildSettings, args, emojis }) => {
  const { member } = interaction;
  const { permissionLevel, permissionName } = member.perms;
  interaction.reply({
    embeds: [
      new MessageEmbed()
        .setColor('WHITE')
        .setDescription(`${member.toString()}, your permission level is: __${permissionLevel}__ - **${permissionName}**`)
    ]
  });
}, {
  permLevel: 'User',
  clientPermissions: ['EMBED_LINKS'],
  required: false,
  globalCommand: true,
  testCommand: false,
  data: {
    description: 'Tells you your permission level for executing bot commands.',
  }
});
