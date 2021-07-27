exports.run = async ({ client, message, args }) => {

    const event = args[0];

    switch (event) {
        case 'channelcreate':
            client.emit('channelCreate', message.channel);
        break;

        case 'channeldelete':
            client.emit('channelDelete', message.channel);
        break;

        case 'channelupdate':
            client.emit('channelUpdate', (message.channel, message.channel));
        break;

        case 'debug':
            client.emit('debug', message.content);
        break;

        case 'error':
            client.emit('error', message.content);
        break;

        case 'guildbanadd':
            client.emit('guildBanAdd', message.author);
        break;

        case 'guildbanremove':
            client.emit('guildBanRemove', message.author);
        break;

        case 'guildcreate':
            client.emit('guildCreate', message.guild);
        break;

        case 'guilddelete':
            client.emit('guildDelete', message.guild);
        break;

        case 'guildmemberadd':
            client.emit('guildMemberAdd', message.member);
        break;

        case 'guildmemberremove':
            client.emit('guildMemberRemove', message.member);
        break;

        case 'guildmemberupdate':
            client.emit('guildMemberUpdate', message.member);
        break;

        case 'guildunavailable':
            client.emit('guildUnavailable', message.guild);
        break;

        case 'guildupdate':
            client.emit('guildUpdate', (message.guild, message.guild));
        break;

        case 'messagedelete':
            client.emit('messageDelete', message);
        break;

        case 'messageupdate':
            client.emit('messageUpdate', (message, message));
        break;

        case 'ready':
            client.emit('ready');
        break;

        case 'rolecreate':
            client.emit('roleCreate', message.member.roles.highest);
        break;

        case 'roledelete':
            client.emit('roleDelete', message.member.roles.highest);
        break;

        case 'roleupdate':
            client.emit('roleUpdate', (message.member.roles.highest, message.member.roles.cache.random()));
        break;

        case 'userupdate':
            client.emit('userUpdate', message.author.user);
        break;

        case 'warn':
            client.emit('warn', message.content);
        break;

        /*
        case '':
            client.emit('', );
        break;
        */

        default:
        return client.send('no', message, 'that\'s not a valid event to emit!');
    }

    client.send('yes', message, `successfully emitted \`${event}\`!`);
};

exports.config = {
    enabled: true,
    required: false,
    aliases: [],
    permLevel: 'Developer',
    cooldown: -1,
    clientPermissions: [],
    userPermissions: []
};

exports.help = {
    name: 'emit',
    category: 'Developer',
    shortDescription: 'Emit an event to the client.',
    longDescription: 'Emit an event to the client. Useful for testing and troubleshooting.',
    usage: '<command> <event>',
    examples: ['emit guildMemberAdd', 'emit messagedelete']
};

exports.args = {
    required: [
        {
            index: 0,
            name: 'Event',
            options: [
                'channelcreate',
                'channeldelete',
                'channelupdate',
                'debug',
                'error',
                'guildbanadd',
                'guildbanremove',
                'guildcreate',
                'guilddelete',
                'guildmemberadd',
                'guildmemberremove',
                'guildmemberupdate',
                'guildunavailable',
                'guildupdate',
                'messagedelete',
                'messageupdate',
                'ready',
                'rolecreate',
                'roledelete',
                'roleupdate',
                'userupdate',
                'warn'
            ],
            flexible: false
        }
    ],
    optional: [],
    flags: []
};
