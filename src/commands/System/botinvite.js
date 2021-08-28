const { MessageEmbed } = require('discord.js');
const { stripIndents } = require('common-tags');
const Command = require('../../classes/Command');
const { getBotInvite } = require('../../utils/tools');

module.exports = new Command(({ client, interaction, guildSettings, args, emojis }) => {
  const botInviteLink = getBotInvite(client);
  interaction.reply({
    embeds: [
      new MessageEmbed()
        .setColor(client.json.colors.main)
        .setDescription(
          stripIndents`${emojis.response.success} ${interaction.member}, here you go: [Click to invite](${botInviteLink} "Invite Me!")`
        )
    ]
  });
}, {
  permLevel: 'User',
  clientPermissions: ['EMBED_LINKS'],
  testCommand: false,
  globalCommand: true,
  data: {
    description: 'Get the link to add this bot to other servers.'
  }
});
