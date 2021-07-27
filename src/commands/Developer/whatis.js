exports.run = async ({ client, message, args }) => {

    const ID = args[0];
    args = [ ID ];
    const { guild } = message;

    if (isNaN(ID)) return client.send('no', message, 'that doesn\'t look like an ID!');

    const channel = guild.channels.cache.get(ID);
    const role = guild.roles.cache.get(ID);
    const member = guild.members.cache.get(ID);

    if (channel) await client.commands.get('channelinfo').run({ client, message, args });
    else if (role) await client.commands.get('roleinfo').run({ client, message, args });
    else if (member) await client.commands.get('userinfo').run({ client, message, args });
    else client.send('no', message, 'I can\'t find any server channel/role/member with that ID!');

};

exports.config = {
    enabled: true,
    required: true,
    aliases: ['wi'],
    permLevel: 'Developer',
    cooldown: -1,
    clientPermissions: [],
    userPermissions: []
};

exports.help = {
    name: 'whatis',
    category: 'Developer',
    shortDescription: 'Checks the discord type of an ID: role, channel or user.',
    longDescription: 'Ever had a random ID in your code (which is bad practise btw), you can use this to figure out what it is without using 3 separate commands.',
    usage: '<command> <ID>',
    examples: [
        'whatis 012345678912345678'
    ]
};

exports.args = {
    required: [
        {
            index: 0,
            name: 'ID',
            options: ['Any ID'],
            flexible: true
        }
    ],
    optional: [],
    flags: []
};
