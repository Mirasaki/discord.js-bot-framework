const { forceLoadCommand } = require('../../handlers/commands');
exports.run = async ({ client, message, args }) => {

    if (client.commands.get(args[0]) || client.commands.get(client.aliases.get(args[0]))) {
        return client.send('no', message, 'that command is already registered!');
    }

    try {

        switch (forceLoadCommand(client, args[0])) {
            case true:
                client.send('yes', message, `successfully added \`${args[0]}.js\` to the command registery!`);
            break;

            case undefined:
                client.send('no', message, `I couldn't find \`${args[0]}.js\`. Are you sure this is a new file?`);
            break;

            case false:
                client.send('no', message, 'it would seem like that command is still globally disabled!');
            break;
        }

    } catch(err) {
        client.send('no', message, 'an error has occurred! Check the console or your error-log channel!');
        client.channels.cache.get(client.extras.errorChannelID).send(`❗ An error has occurred trying to register the ${args[0]} command, click to reveal:\n\n||${err}||`);
        console.log(err);
    }


};

exports.config = {
    enabled: true,
    required: false,
    aliases: ['reg', 'addcommand', 'addcmd'],
    permLevel: 'Developer',
    cooldown: -1,
    clientPermissions: [],
    userPermissions: []
};

exports.help = {
    name: 'register',
    category: 'Developer',
    shortDescription: 'Register a new command.',
    longDescription: 'Register a new command, useful when you want to add something to an online bot when you really can\'t shut it down at the moment. This is a separate command because calling the "reload" command for loading/resgistering something new just doesn\'t make sense.',
    usage: '<command> <command file name, aliases won\'t work>',
    examples: []
};

exports.args = {
    required: [
        {
            index: 0,
            name: 'Command',
            options: ['Any command name', 'File name without it\'s extention'],
            flexible: true
        }
    ],
    optional: [],
    flags: []
};
