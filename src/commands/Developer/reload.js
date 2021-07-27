const { forceLoadCommand, forceUnloadCommand } = require('../../handlers/commands');
exports.run = async ({ client, message, args }) => {

    const commandName = args[0].toLowerCase();

    const command = client.commands.get(commandName) || client.commands.get(client.aliases.get(commandName));

    if (!command) {
        return client.send('no', message, 'I couldn\'t find that command!');
    }

    try {
        forceUnloadCommand(client, command.help.name);
        forceLoadCommand(client, command.help.name);
        if (client.commands.get(command.help.name)) client.send('yes', message, `successfully re-loaded \`${command.help.name}\`!`);
        else client.send('no', message, `\`${command.help.name}\` has been globally disabled!`);
    } catch(err) {
        client.send('no', message, `could not reload \`${args[0].toLowerCase()}.js\`.\n\nClick to reveal error below:\n||${err.stack}||`);
        return console.log(err.stack || err);
    }

};

exports.config = {
    enabled: true,
    required: true,
    aliases: ['rl'],
    permLevel: 'Developer',
    cooldown: -1,
    clientPermissions: [],
    userPermissions: []
};

exports.help = {
    name: 'reload',
    category: 'Developer',
    shortDescription: 'Reloads a command that has been modified.',
    longDescription: 'Reload a command that has been modified. Instead of having to reboot the client, this reloads the command individually.',
    usage: 'reload <command name>',
    examples: [
        'reload help',
        'rl h',
        'rl help'
    ]
};

exports.args = {
    required: [
        {
            index: 0,
            name: 'Command',
            options: ['Any command name', 'File name without it\'s extension'],
            flexible: true
        }
    ],
    optional: [],
    flags: []
};
