const { deleteFromCache, getSettings } = require('../../mongo/helpers/settings');

exports.run = async ({ client, message, args }) => {

const settings = await getSettings(message.guild.id);

if (!args[0]) return client.send('no', message, 'provide the new prefix!');

if (args.join(' ').length > 9) return client.send('no', message, 'provide **up to** 10 characters.');

settings._prefix = `${args.join(' ')}`;
await settings.save();
deleteFromCache(message.guild.id);

client.send('yes', message, `your prefix has been updated to: \`${settings._prefix}\`!`);

};

exports.config = {
    enabled: true,
    required: false,
    aliases: ['pre', 'pref'],
    permLevel: 'Administrator',
    cooldown: -1,
    clientPermissions: ['MANAGE_MESSAGES'],
    userPermissions: []
};

exports.help = {
    name: 'prefix',
    category: 'System',
    shortDescription: 'Change your servers prefix.',
    longDescription: 'Change your servers prefix. You can also do this by using the `settings` command, this is just simpler and quicker.',
    usage: '<command> <newPrefix>',
    examples: ['prefix a!']
};

exports.args = {
    required: [
        {
            index: 0,
            name: 'New Prefix',
            options: ['Any (up to) 10 character string of text.'],
            flexible: true
        }
    ],
    optional: [],
    flags: []
};
