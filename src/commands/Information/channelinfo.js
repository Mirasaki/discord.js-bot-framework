const { MessageEmbed } = require('discord.js');
exports.run = async ({ client, message, args }) => {

    if (!args[0]) return client.send('no', message, 'please provide a channel by mention/tag/# or ID!');

    const channel = message.mentions.channels.first()
    || message.guild.channels.cache.get(args[0]);

    if (!channel) return client.send('no', message, 'I can\'t find that channel!');

    const channelEmbed = new MessageEmbed()
    .setColor(client.extras.primaryEmbedColor)
    .setAuthor(`${channel.type.toProperCase()} Channel information for ${channel.name}!`)
    .setTimestamp();

    if (channel.type === 'text') {
        channelEmbed.setDescription(`${channel.toString()} (${channel.name}-\`${channel.id}\`)\n\n**Topic:** ${channel.topic ? `${channel.topic}` : 'No topic has been set!'}\n**Permissions Synced:** ${channel.permissionsLocked ? 'Yes' : 'No'}\n**Last Message:** [Link](${channel.lastMessage.url})\n**Members with access:** ${channel.members.size}\n**NSFW:** ${channel.nsfw ? 'Yes' : 'No'}\n**Parent:** ${channel.parent ? `${channel.parent.name}` : 'None!'}\n**Slowmode:** ${channel.rateLimitPerUser > 0 ? `${channel.rateLimitPerUser >= 61 ? `${channel.rateLimitPerUser >= 3600 ? `${channel.rateLimitPerUser / 60 / 60} hours\n` : `${channel.rateLimitPerUser / 60} minutes\n`}` : `${channel.rateLimitPerUser} seconds`}` : 'Slowmode isn\'t active!'}\n**Created at:** ${channel.createdAt.toDateString()}`);
    } else if (channel.type === 'voice') {
        channelEmbed.setDescription(`${channel.name}-\`${channel.id}\`\n\n**Bitrate:** ${channel.bitrate / 1000} kb/s\n**Members In Channel:** ${channel.members ? `${channel.members.size}` : 'None!'}\n**Parent:** ${channel.parent ? `${channel.parent.name}` : 'None!'}\n**Permissions Synched:** ${channel.permissionsLocked ? 'Yes' : 'No'}\n**User Limit:** ${channel.userLimit === 0 ? 'No Limit!' : `${channel.userLimit}`}\n**Created at:** ${channel.createdAt.toDateString()}`);
    } else if (channel.type === 'category') {
        channelEmbed.setDescription(`${channel.name}-\`${channel.id}\`\n\n**Channel Children:** ${channel.children.size}\n**Created at:** ${channel.createdAt.toDateString()}`);
    }

    message.channel.send(channelEmbed);

};

exports.config = {
    enabled: true,
    required: false,
    aliases: ['ci', 'cinfo', 'channeli'],
    permLevel: 'Moderator',
    cooldown: 15,
    clientPermissions: ['EMBED_LINKS'],
    userPermissions: []
};

exports.help = {
    name: 'channelinfo',
    category: 'Information',
    shortDescription: 'Displays channel information.',
    longDescription: 'Displays channel information, things like the topic, amount of members with access and all that good stuff.',
    usage: '<command> <mention/tag/#/ID>',
    examples: ['channelinfo #general-chat', 'ci 000000000000000001']
};

exports.args = {
    required: [
        {
            index: 0,
            name: 'Channel',
            options: ['tag', 'mention', '#', 'channelID'],
            flexible: true
        }
    ],
    optional: [],
    flags: []
};
