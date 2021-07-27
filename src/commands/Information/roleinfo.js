const { MessageEmbed } = require('discord.js');
const status = {
    false: 'No',
    true: 'Yes'
};
exports.run = async ({ client, message, args }) => {
    if (!args[0]) return client.send('no', message, 'please provide a role by mention/tag/@ or ID!');

    let role = message.mentions.roles.first()
    || message.guild.roles.cache.get(args[0]);

    if (args[0] === message.guild.id || args[0] === '@everyone') role = message.guild.roles.cache.get(message.guild.id);

    if (!role) return client.send('no', message, 'I couldn\'t find that role!');

    const roleEmbed = new MessageEmbed()
    .setColor(role.hexColor || client.extras.primaryEmbedColor)
    .setAuthor(`Role Info for ${role.name}!`)
    .setDescription(`${role.toString()} (${role.name}-\`${role.id}\`)\n\n**Color:** \`${role.hexColor}\`-\`${role.color}\`\n**Hoisted:** ${role.hoist ? 'Role **__IS__** shown individually in member list' : 'Role is **__NOT__** shown individually in the member list'}\n**Members with role:** ${role.members.size >= 1 ? `${role.members.size === 1 ? '1 member' : `${role.members.size} members`}` : '0 Members'}\n**Position:** ${role.position}\n**Mentionable:** ${status[role.mentionable]}\n**Permissions:** ${role.permissions.bitfield ? '`' + role.permissions.toArray().join('`, `').replace(/_/g, ' ').toProperCase() + '`' : 'None'}\n**Created at:** ${role.createdAt.toDateString()}`);

    message.channel.send(roleEmbed);
};

exports.config = {
    enabled: true,
    required: false,
    aliases: ['ri', 'rolei', 'rinfo'],
    permLevel: 'Moderator',
    cooldown: 10,
    clientPermissions: ['EMBED_LINKS'],
    userPermissions: []
};

exports.help = {
    name: 'roleinfo',
    category: 'Information',
    shortDescription: 'Displays role information.',
    longDescription: 'Displays role information, things like the amount of members that have the role, hex color used, permissions and all that good stuff.',
    usage: '<command> <mention/tag/@/ID>',
    examples: ['ri @Name', 'roleinfo 000000000000000001']
};

exports.args = {
    required: [
        {
            index: 0,
            name: 'Role',
            options: ['mention', 'tag', '@', 'roleID'],
            flexible: true
        }
    ],
    optional: [],
    flags: []
};
