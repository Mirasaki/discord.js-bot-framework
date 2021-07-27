const { MessageEmbed } = require('discord.js');
const filterLevels = {
	DISABLED: 'Off',
	MEMBERS_WITHOUT_ROLES: 'Members without role',
	ALL_MEMBERS: 'Everyone'
};
const verificationLevels = {
	NONE: 'None',
	LOW: 'Low',
	MEDIUM: 'Medium',
	HIGH: '(╯°□°）╯︵ ┻━┻',
	VERY_HIGH: '┻━┻ ﾐヽ(ಠ益ಠ)ノ彡┻━┻'
};
const regions = {
	brazil: 'Brazil',
	europe: 'Europe',
	hongkong: 'Hong Kong',
	india: 'India',
	japan: 'Japan',
	russia: 'Russia',
	singapore: 'Singapore',
	southafrica: 'South Africa',
	sydeny: 'Sydeny',
	'us-central': 'US Central',
	'us-east': 'US East',
	'us-west': 'US West',
    'us-south': 'US South',
    'eu-central': 'Central Europe',
    sydney: 'Sydney',
    'eu-west': 'Western Europe',
    'vip-us-east': 'VIP U.S. East',
    london: 'London',
    amsterdam: 'Amsterdam'
};

exports.run = async ({ client, message }) => {
    const roles = message.guild.roles.cache.sort((a, b) => b.position - a.position).map(role => role.toString());
    const members = message.guild.members.cache;

    const invites = await message.guild.fetchInvites({
        limit: 1
    });

    const features = message.guild.features.map(feature => feature.replace(/_/g, ' ').toProperCase());

    const embed = new MessageEmbed()
    .setAuthor(message.guild.toString(), message.guild.iconURL({ dynamic: true }) || 'https://maxcdn.icons8.com/Share/icon/Logos//discord_logo1600.png')
    .setDescription(`Guild information for __${message.guild.name}__`)
    .setColor(client.extras.primaryEmbedColor)
    .setThumbnail(message.guild.iconURL({ dynamic: true }) || 'https://maxcdn.icons8.com/Share/icon/Logos//discord_logo1600.png')
    .setDescription([
        `**Name & ID:** ${message.guild.name}/\`${message.guild.id}\``,
        `**Owner:** ${message.guild.owner.user.toString()}/\`${message.guild.ownerID}\``,
        `**Region:** ${regions[message.guild.region]}`,
        `**Nitro Boosts:** ${message.guild.premiumSubscriptionCount ? message.guild.premiumSubscriptionCount + ` (Level: ${message.guild.premiumTier})` : 'None yet, someone should change that! <:pepeGod:770962030093533214>'}`,
        `**Explicit Filter:** ${filterLevels[message.guild.explicitContentFilter]}`,
        `**Verification Level:** ${verificationLevels[message.guild.verificationLevel]}`,
        `**Time Created:** ${message.guild.createdAt.toString().substr(0, 15)}, ${await client.checkDays(message.guild.createdAt)}`,
        `**Members:** ${members.size} (__${members.filter(member=> member.user.bot).size} bots!__)`,
        `**Channels:** ${message.guild.channels.cache.filter(channel => channel.type === 'text').size} Text / ${message.guild.channels.cache.filter(channel => channel.type === 'voice').size} Voice / ${message.guild.channels.cache.filter(channel => channel.type === 'category').size} Categorys`,
        `**Emojis:** ${message.guild.emojis.cache.filter(emoji => !emoji.animated).size} Static / ${message.guild.emojis.cache.filter(emoji => emoji.animated).size} Animated / ${message.guild.emojis.cache.size} Total`,
        `**Features:** ${message.guild.features.length >= 1 ? '`' + features.join('`, `') + '`' : 'None!'}`,
        `**Invite:** ${invites.first() || 'No invite was found!'}`,
        '\u200b',
        '\u200b',
        '**__Member Status__**',
        `Online: ${members.filter(member => member.presence.status === 'online').size}`,
        `Idle: ${members.filter(member => member.presence.status === 'idle').size}`,
        `Do Not Disturb: ${members.filter(member => member.presence.status === 'dnd').size}`,
        `Offline: ${members.filter(member => member.presence.status === 'offline').size}`,
        '\u200b',
        '\u200b',
        `**__Roles:__** ${roles.length - 1}\n`,
        roles.length <= 15 ? roles.join(', ') : roles.length > 15 ? await trimArray(roles, 15) : 'None'
    ])
    .setTimestamp();
    message.channel.send(embed);
};

exports.config = {
    enabled: true,
    required: false,
    aliases: ['si', 'serveri', 'sinfo'],
    permLevel: 'Moderator',
    cooldown: 0,
    clientPermissions: [
        'EMBED_LINKS',
        'VIEW_CHANNEL',
        'VIEW_GUILD_INSIGHTS',
        'MANAGE_GUILD'
    ],
    userPermissions: []
};

exports.help = {
    name: 'serverinfo',
    category: 'Information',
    shortDescription: 'Displays server information.',
    longDescription: 'Displays server information. Things like the Region the server is hosted in, nitro boosts, explicit filter level and all that good stuff.',
    usage: '<command>',
    examples: ['si']
};

exports.args = {
    required: [],
    optional: [],
    flags: []
};

async function trimArray(arr, maxLen) {
    if (arr.length > maxLen) {
        const len = arr.length - maxLen;
        arr = arr.slice(0, maxLen);
        arr.push(` __**& ${len} more roles...**__`);
    }
    return arr;
}
