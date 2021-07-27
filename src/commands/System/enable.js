const { deleteFromCache, getSettings } = require('../../mongo/helpers/settings');
const { getLevelCache } = require('../../handlers/permissions');
const levelCache = getLevelCache();

exports.run = async ({ client, message, args, guildSettings }) => {
    const command = args.shift().toLowerCase();
    const cmd = client.commands.get(command) || client.commands.get(client.aliases.get(command));
    if (!cmd) return client.send('no', message, 'I couldn\'t find that command!');

    const disabledCommands = guildSettings.disabled_cmds;

    if (!disabledCommands.find(v => v === cmd.help.name)) return client.send('no', message, 'that command isn\'t disabled!');
    if (message.author.permLevel < levelCache[cmd.config.permLevel]) return client.send('no', message, 'your permission level isn\'t high enough to re-enable that command!');

    try {

        const settings = await getSettings(message.guild.id);
        const index = disabledCommands.indexOf(cmd.help.name);
        settings.disabled_cmds.splice(index, 1);
        deleteFromCache(message.guild.id);
        await settings.save();

        client.send('yes', message, `re-enabled command \`${cmd.help.name}\`!`);

    } catch(err) {
        console.log(err);
    }

};

exports.config = {
    enabled: true,
    required: true,
    aliases: [],
    permLevel: 'Administrator',
    cooldown: -1,
    clientPermissions: [],
    userPermissions: []
};

exports.help = {
    name: 'enable',
    category: 'System',
    shortDescription: 'Re-enable specific commands.',
    longDescription: 'Re-enable specific commands you have previously disabled. This only applies to the server the command is called in.',
    usage: '<enable> <command name>',
    examples: ['enable debug']
};

exports.args = {
    required: [
        {
            index: 0,
            name: 'Command',
            options: ['Any command name'],
            flexible: true
        }
    ],
    optional: [],
    flags: []
};
