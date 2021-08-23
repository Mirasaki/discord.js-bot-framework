const { MessageEmbed } = require('discord.js');
const { stripIndents } = require('common-tags');
exports.run = ({ client, interaction, guildSettings, args, emojis }) => {
  const botInviteLink = client.json.config.links.botInvite
    .replace(/{{clientId}}/, `${client.user.id}`);

  interaction.reply({
    embeds: [
      new MessageEmbed()
        .setColor(client.json.colors.main)
        .setDescription(
          stripIndents`${emojis.response.success} ${interaction.member}, 
            here you go: [Click to invite](${botInviteLink} "Invite Me!")
          `
        )
    ]
  });
};

exports.config = {
  permLevel: 'User',
  clientPermissions: ['EMBED_LINKS']
};

exports.slash = {
  description: 'Get the link to add this bot to other servers.',
};
