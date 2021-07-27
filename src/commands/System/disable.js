const { deleteFromCache, getSettings } = require('../../mongo/helpers/settings');
const { getLevelCache } = require('../../handlers/permissions');
const levelCache = getLevelCache();
const Discord = require('discord.js');

exports.run = async ({ client, message, args, guildSettings }) => {

    const tagExecutor = message.author.toString();
    const disabledCommands = guildSettings.disabled_cmds;

    if (args[0] === 'list') {
        if (disabledCommands.length < 1) return client.send('no', message, 'no commands have been disabled!');
        return message.channel.send({ embed: getEmbed(client, message, guildSettings) });
    }

    const command = args.shift().toLowerCase();
    const cmd = client.commands.get(command) || client.commands.get(client.aliases.get(command));

    if (!cmd) return client.send('no', message, 'I couldn\'t find that command!');
    if (cmd.config.required) return client.send('no', message, 'that command can\'t be disabled!');
    if (disabledCommands.find(v => v === cmd.help.name)) return client.send('no', message, 'that command is already disabled!');
    if (message.author.permissionLevel < levelCache[cmd.config.permLevel]) return client.send('no', message, 'your permission level isn\'t high enough to disable that command!');


    try {

        const settings = await getSettings(message.guild.id);
        settings.disabled_cmds.push(cmd.help.name);
        deleteFromCache(message.guild.id);
        await settings.save();

        message.channel.send(`${client.extras.yesIcon} ${tagExecutor}, added \`${cmd.help.name}\` to your disabled commands!`, { embed: getEmbed(client, message, settings) });

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
    clientPermissions: ['EMBED_LINKS'],
    userPermissions: []
};

exports.help = {
    name: 'disable',
    category: 'System',
    shortDescription: 'Disable specific commands.',
    longDescription: 'Disable specific commands. This only applies to the server the command is called in.',
    usage: '<disable> <command name>',
    examples: ['disable debug']
};

exports.args = {
    required: [
        {
            index: 0,
            name: 'List / Command',
            options: ['list', 'any of the commands name shown when you call the "help" command'],
            flexible: true
        }
    ],
    optional: [],
    flags: []
};

const getEmbed = (client, message, settings) => {
    return new Discord.MessageEmbed()
        .setColor(client.extras.primaryEmbedColor)
        .setAuthor(`All disabled commands for ${message.guild.name}`, message.guild.iconURL({ dynamic: true }) || client.extras.defaultImageLink)
        .setDescription(`\`${settings.disabled_cmds.join('`, `')}\``);
};
