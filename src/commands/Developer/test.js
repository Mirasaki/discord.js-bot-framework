exports.run = async ({ client, message }) => {
    client.send('yes', message, 'success!');
    client.send('wait', message, 'working!');
    client.send('no', message, 'failed!');
    client.send('test', message, 'error!');
};

exports.config = {
    enabled: true,
    required: false,
    aliases: ['t'],
    permLevel: 'Developer',
    cooldown: -1,
    clientPermissions: [],
    userPermissions: []
};

exports.help = {
    name: 'test',
    category: 'Developer',
    shortDescription: 'Test functionality with this command.',
    longDescription: 'Test functionality with this command. For the testing of smaller things and bits of code, consider using the eval command.',
    usage: '<command>',
    examples: []
};

exports.args = {
    required: [],
    optional: [],
    flags: [
        {
            flag: 'test',
            result: 'Calling this command flag will **do this**',
            permLevel: 'Developer',
            permissions: ['MANAGE_GUILD']
        }
    ]
};
