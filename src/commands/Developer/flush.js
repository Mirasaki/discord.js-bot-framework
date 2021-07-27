const { deleteFromCache } = require('../../mongo/helpers/settings');

exports.run = async ({ client, message }) => {
    deleteFromCache(message.guild.id, true);
    client.send('yes', message, 'the settings-cache has been purged!');
};

exports.config = {
    enabled: true,
    required: true,
    aliases: [],
    permLevel: 'Developer',
    cooldown: 5,
    clientPermissions: [],
    userPermissions: []
};

exports.help = {
    name: 'flush',
    category: 'Developer',
    shortDescription: 'Flush the settings cache!',
    longDescription: 'Flush the settings cache, clean more cache objects as you add more memory-cached entries.',
    usage: '<command> <cache>',
    examples: ['flush settings']
};

exports.args = {
    required: [
        {
            index: 0,
            name: 'cache',
            options: ['settings'],
            flexible: false
        }
    ],
    optional: [],
    flags: []
};
