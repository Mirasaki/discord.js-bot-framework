const Discord = require('discord.js');
const { getCoreBoolean } = require('../../handlers/arguments');
const { deleteFromCache, getSettings } = require('../../mongo/helpers/settings');
exports.run = async ({ client, message, args, guildSettings }) => {

    const action = args.shift();
    const key = args.shift();
    let value = args;

    if (action === 'edit') {

        try {

            const settings = await getSettings(message.guild.id);

            if (!value[0]) return client.send('no', message, 'provide a `key` to edit and a `new value`!');
            const newValue = value.join(' ');
            let keyToEdit = '';

            const channel = message.mentions.channels.first() ||
                message.guild.channels.cache.find(c => c.name === newValue) ||
                message.guild.channels.cache.get(value[0]);

            const role = message.mentions.roles.first() ||
                message.guild.roles.cache.find(r => r.name === newValue) ||
                message.guild.roles.cache.get(value[0]);

            switch(Number(key)) {
                case 1:
                    if (newValue.length > 10) return client.send('no', message, 'prefix can\'t be longer than 10 characters!');
                    keyToEdit = 'Prefix';
                    if (settings._prefix === newValue) return client.send('no', message, `\`${keyToEdit}\` is already set to \`${newValue}\`!`);
                    settings._prefix = `${newValue}`;
                break;

                case 2:
                    if (!role) return client.send('no', message, 'I can\'t find that role!');
                    keyToEdit = 'Helper Role';
                    if (settings.permissions.helper_role === role.id) return client.send('no', message, `\`${keyToEdit}\` is already set to \`@${role.name}\`!`);
                    settings.permissions.helper_role = role.id;
                    value = '@' + role.name;
                break;

                case 3:
                    if (!role) return client.send('no', message, 'I can\'t find that role!');
                    keyToEdit = 'Mod Role';
                    if (settings.permissions.mod_role === role.id) return client.send('no', message, `\`${keyToEdit}\` is already set to \`@${role.name}\`!`);
                    settings.permissions.mod_role = role.id;
                    value = '@' + role.name;
                break;

                case 4:
                    if (!role) return client.send('no', message, 'I can\'t find that role!');
                    keyToEdit = 'Admin Role';
                    if (settings.permissions.admin_role === role.id) return client.send('no', message, `\`${keyToEdit}\` is already set to \`@${role.name}\`!`);
                    settings.permissions.admin_role = role.id;
                    value = '@' + role.name;
                break;

                case 5:
                    if (getCoreBoolean(value) === undefined) return client.send('no', message, 'available values are `true/false`, `enabled/disabled` & `yes/no`!');
                    keyToEdit = 'Permission Notice';
                    if (settings.permissions.permission_notice === `${getCoreBoolean(value)}`) return client.send('no', message, `\`${keyToEdit}\` is already set to \`${getCoreBoolean(value)}\`!`);
                    settings.permissions.permission_notice = `${getCoreBoolean(value)}`;
                    value = `${getCoreBoolean(value)}`;
                break;

                case 6:
                    if (!channel) return client.send('no', message, 'I can\'t find that channel!');
                    keyToEdit = 'Mod Log Channel';
                    if (settings.channels.mod_log_channel === channel.id) return client.send('no', message, `\`${keyToEdit}\` is already set to \`#${channel.name}\`!`);
                    if (channel.type != 'text') return client.send('no', message, 'provide a text channel!');
                    settings.channels.mod_log_channel = channel.id;
                    value = '#' + channel.name;
                break;

                case 7:
                    keyToEdit = 'Restrict Cmds Channel';
                    if (getCoreBoolean(value) === false) {
                        if (settings.channels.restrict_cmds_channel === 'false') return client.send('no', message, `\`${keyToEdit}\` is already set to \`#${channel.name}\`!`);
                        settings.channels.restrict_cmds_channel = 'false';
                        value = 'false';
                        break;
                    }
                    if (!channel) return client.send('no', message, 'I can\'t find that channel!');
                    if (channel.type != 'text') return client.send('no', message, 'provide a text channel!');
                    if (settings.channels.restrict_cmds_channel === channel.id) return client.send('no', message, `\`${keyToEdit}\` is already set to \`#${channel.name}\`!`);
                    settings.channels.restrict_cmds_channel = channel.id;
                    value = '#' + channel.name;
                break;

                default:
                return client.send('no', message, 'that\'s not an option!');
            }

            await message.delete();
            await settings.save();
            client.send('yes', message, `successfully changed \`${key} => ${keyToEdit}\` to \`${value}\``);

        } catch(err) {
            client.send('no', message, 'an error has occurred! A log has been sent to the bot creators, try again later!');
            client.channels.cache.get(client.extras.errorChannelID).send(`❗ An error has occurred in the \`settings\` command, click to reveal:\n\n||${err}||`);
            console.log(err);
        }

        deleteFromCache(message.guild.id);

    } else if (action === 'reset') {

        await client.send('wait', message, 'are you sure you want to reset your settings?');
        const filter = m => m.author.id === message.author.id && getCoreBoolean(m.content.toLowerCase()) != null;
        await message.channel.awaitMessages(filter, { max: 1, time: 15000, errors: ['time'] })
        .then(async collected => {
            if (getCoreBoolean(collected.first().content.toLowerCase()) === true) {
                const settings = await getSettings(message.guild.id);
                try {
                    await settings.delete();
                    deleteFromCache(message.guild.id);
                    client.send('yes', message, 'successfully reset your settings!');
                } catch(error) {
                    console.log(error);
                }
            } else {
                client.send('no', message, 'cancelled!');
            }
        });

    } else if (action === 'help') {

        const helpEmbed = new Discord.MessageEmbed()
        .setColor(client.extras.primaryEmbedColor)
        .setDescription(`**\`${guildSettings.prefix} settings edit <1 up to 7> <new value>\`**`)
        .addField('Prefix', `The character you call the bot by. Your prefix is \`${guildSettings.prefix}\``, true)
        .addField('Helper Role', 'The role required for members to execute commands with a permission level of `Helper`.', true)
        .addField('Mod Role', 'The role required for members to execute commands with a permission level of `Moderator`.', true)
        .addField('Admin Role', 'The role required for members to execute commands with a permission level of `Administrator`.', true)
        .addField('Permission Notice', 'If enabled, this will send a notice to the member when they execute a command which their permission level isn\'t high enough for.', true)
        .addField('Mod Log Channel', 'The channel to send messages and logs relevant to Moderators and Administrators.', true)
        .addField('Restrict Commands Channel', 'If enabled, and valid, this will delete any commands executed in a channel which is **not** this one.', false)
        .addField('\u200B', '\u200B', false)
        .addField('Example #1', `**\`\`\`${guildSettings.prefix}settings edit 1 a!\`\`\`**`, true)
        .addField('Example #2', `**\`\`\`${guildSettings.prefix}set edit 2 @Helper\`\`\`**`, true)
        .addField('Example #3', `**\`\`\`${guildSettings.prefix}set edit 5 nah\`\`\`**`, true)
        .setTimestamp();

        message.channel.send(helpEmbed);

    } else {

        const settingsEmbed = new Discord.MessageEmbed()
        .setColor(client.extras.primaryEmbedColor)
        .setAuthor(`Essential Settings for ${message.guild.name}!`, message.guild.iconURL({ dynamic: true }) || client.extras.defaultImageLink)
        .setFooter(`Don't know what a setting does or how to edit it?\nType: ${guildSettings.prefix}settings help`);

        let counter = 0;

        Object.entries(guildSettings).forEach(([key, value]) => {
            if (key === 'disabled_cmds') return;
            if (typeof value === 'object') {
                Object.entries(value).forEach(([subKey, subValue]) => {
                    if (subKey === '$init') return;
                    counter++;
                    addField(message, settingsEmbed, subKey, subValue, counter);
                });
            } else {
                counter++;
                addField(message, settingsEmbed, key, value, counter);
            }
        });

        message.channel.send(settingsEmbed);
    }

};

exports.config = {
    enabled: true,
    required: true,
    aliases: ['set'],
    permLevel: 'Administrator',
    cooldown: -1,
    clientPermissions: ['EMBED_LINKS', 'MANAGE_MESSAGES'],
    userPermissions: []
};

exports.help = {
    name: 'settings',
    category: 'System',
    shortDescription: 'Change your server\'s settings.',
    longDescription: 'Displays all settings for your server. \n\nMention/tag/@ to change role settings.\nMention/tag/# to change channel settings.\n\'true/enabled/yes\' or \'false/disabled/no\' to change yes/no settings.',
    usage: '<command> [edit] [number] [newValue]',
    examples: [
        'settings',
        'set edit 1 a!',
        'set edit 2 @Moderator',
        'set edit 5 yep',
        'set edit 6 #mod-log',
        'set edit 7 nah'
    ]
};

exports.args = {
    required: [],
    optional: [],
    flags: []
};

const addField = (message, embed, key, value, counter) => {
    const channel = message.guild.channels.cache.get(value);
    const role = message.guild.roles.cache.get(value);
    if (channel || role) return embed.addField(`__${counter}__ ${key.replace(/_/g, ' ').toProperCase()}`, `${role ? `${role.toString()}` : `${channel.toString()}`}`, false);
    if (typeof value === 'boolean' || value === 'true' || value === 'false') {
        embed.addField(`__${counter}__ ${key.replace(/_/g, ' ').toProperCase()}`, `${value === true ? '✅ Enabled' : '⛔ Disabled'}`, false);
    } else {
        embed.addField(`__${counter}__ ${key.replace(/_/g, ' ').toProperCase()}`, `${!value ? 'None!' : `${value}`}`, false);
    }
};
