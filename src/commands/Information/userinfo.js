const Discord = require('discord.js');
exports.run = async ({ client, message, args }) => {

    if (!args[0]) return client.send('no', message, 'you didn\'t provide the user to look for! Provide an ID, username or mention/tag/@ them.');

    const user = message.mentions.members.first()
    || message.guild.members.cache.get(args[0]);

    if (!user) return client.send('no', message, 'I couldn\'t find that user!');
    const roles = user.roles.cache.sort((a, b) => b.position - a.position).map(role => role.toString());
    const userEmbed = new Discord.MessageEmbed()
    .setColor(user.roles.highest.color || client.extras.primaryEmbedColor)
    .setTitle(`User information for "${user.user.username}"!`)
    .setThumbnail(user.user.avatarURL({ dynamic: true }) || 'https://maxcdn.icons8.com/Share/icon/Logos//discord_logo1600.png')
    .setDescription(`**User:** ${user.user.toString()} (${user.user.username}-\`${user.user.id}\`)${user.nickname != null ? `\n**Nickname:** ${user.nickname}\n` : '\n'}${user.roles.highest.id != message.guild.id ? `**Highest Role:** ${user.roles.highest.toString()}\n` : ''}${user.premiumSince ? `**Server Booster Since:** ${await client.checkDays(user.premiumSince)}\n` : ''}**Status:** ${(user.presence !== null && user.presence.status !== null) ? user.presence.status.toProperCase() : 'Offline'}\n**Playing:** ${user.user.presence && user.user.presence.activities ? `${user.user.presence.activities.length <= 0 ? 'Nothing' : `${user.user.presence.activities}`}\n` : 'Nothing\n'}${user.user.lastMessage ? `**Last Message**: [This Message](${user.user.lastMessage.url}) in ${user.user.lastMessage.channel ? `${user.user.lastMessage.channel.toString() || user.user.lastMessage.channel.name}` : 'Not found'}\n` : ''}**Roles:** ${roles.length - 1}\n ${roles.length <= 15 ? roles.join(', ') : roles.length > 15 ? await trimArray(roles, 15) : 'None'}\n\n**Account Created:** ${await client.checkDays(user.user.createdAt)} - ${user.user.createdAt.toString().substr(0, 15)}\n**Joined Server:** ${await client.checkDays(user.joinedAt)} - ${user.joinedAt.toString().substr(0, 15)}`);

    message.channel.send(userEmbed);
};

exports.config = {
    enabled: true,
    required: false,
    aliases: ['ui', 'useri', 'uinfo', 'whois'],
    permLevel: 'Moderator',
    cooldown: 5,
    clientPermissions: ['EMBED_LINKS'],
    userPermissions: []
};

exports.help = {
    name: 'userinfo',
    category: 'Information',
    shortDescription: 'Displays user information.',
    longDescription: 'Displays user information, things like their ID, highest role, status, activity and all that good stuff.',
    usage: '<command> <id/mention/tag/@>',
    examples: []
};

exports.args = {
    required: [
        {
            index: 0,
            name: 'User',
            options: ['mention', 'tag', '@', 'userID'],
            flexible: true
        }
    ],
    optional: [],
    flags: []
};

async function trimArray(arr, maxLen) {
    if (arr.length > maxLen) {
        const len = arr.length - maxLen;
        arr = arr.slice(0, maxLen);
        arr.push(` __**& ${len} more...**__`);
    }
    return arr;
}
