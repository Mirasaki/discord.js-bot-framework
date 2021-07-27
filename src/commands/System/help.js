const { getLevelCache, getPermissionLevel } = require('../../handlers/permissions');
const { getArgs } = require('../../handlers/arguments');
const levelCache = getLevelCache();

const { MessageEmbed } = require('discord.js');

exports.run = async ({ client, message, args, guildSettings }) => {

    const action = args[0];

    const perms = await getPermissionLevel(message);
    const { permissionLevel } = perms;

    let embedText = '';
    const authorCommands = client.commands.filter(cmd => levelCache[cmd.config.permLevel] <= permissionLevel).array();

    const embed = new MessageEmbed()
    .setAuthor(client.user.username, client.user.avatarURL({ dynamic: true }) || client.extras.defaultImageLink)
    .setThumbnail(message.guild.iconURL({ dynamic: true }) || client.extras.defaultImageLink)
    .setColor(client.extras.primaryEmbedColor);

    if (!action) {

        const commands = authorCommands
            .sort((a, b) => a.help.category > b.help.category
            ? 1
            : ((a.help.name > b.help.name && a.help.category === b.help.category)
                ? 1
                : -1));


        let currentCategory = '';

        commands.forEach(command => {
            const workingCategory = command.help.category.toProperCase();
            if (currentCategory !== workingCategory) {
                embedText += `\n\n***__${workingCategory}__***\n`;
                currentCategory = workingCategory;
            }
            embedText += `\`${command.help.name}\` `;
        });

        embed.setDescription(embedText);
        embed.addField('List by category', `\`\`\`${guildSettings.prefix}help category\`\`\``, true);
        embed.addField('Detailed command information', `\`\`\`${guildSettings.prefix}help command\`\`\``, true);

    } else if (action == 'options' || action == 'args' || action == 'parameters') {

        const commandName = args[1];
        const command = client.commands.get(commandName) || client.commands.get(client.aliases.get(commandName));

        if (!args[1]) return client.send('no', message, 'provide a command name or alias!');
        if (!command) return client.send('no', message, 'I couldn\'t find that command/alias!');

        if (message.author.permLevel < levelCache[command.config.permLevel]) return client.send('no', message, 'you don\'t have permission to use that command!');

        embed.setDescription(`[Options / Arguments](https://pastebin.com/DytkkJ0x) for **\`${command.help.name}\`**!`);
        getArgs(command, embed);

    } else {

        const commandName = args[0];
        const commandsByCategory = authorCommands.filter(p => p.help.category === `${args.join(' ').toProperCase()}`);

        if (!client.commands.get(commandName)
        && !client.commands.get(client.aliases.get(commandName))
        && !commandsByCategory[0]) return client.send('no', message, 'I couldn\'t find that command/alias/category!');

        if (commandsByCategory[0]) {

            embed.setDescription(`**__Prefix:__ ${guildSettings.prefix}**`);

            for(let i = 0; i < commandsByCategory.length; i++) {
                embed.addField(`${commandsByCategory[i].help.name.toProperCase()}`, `\`\`\`${commandsByCategory[i].help.shortDescription}\`\`\``, true);
                if (i != 0 && i % 25 === 0) {
                    message.channel.send(embed);
                    embed.setDescription(`Page: ${Math.round(commandsByCategory.length / 25) + 1}`);
                    embed.spliceFields(0, embed.fields.length);
                }
            }

        } else {

            const command = client.commands.get(commandName) || client.commands.get(client.aliases.get(commandName));

            if (message.author.permLevel < levelCache[command.config.permLevel]) return client.send('no', message, 'you don\'t have permission to use that command!');

            embed.setTitle(`${command.help.name.toProperCase()}`);
            embed.setDescription(`\`\`\`${command.help.longDescription}\`\`\`\n\n***Usage*** =  ${command.help.usage.replace('<command>', command.help.name)}${command.config.aliases.length ? `\n***Aliases*** =  \`${command.config.aliases.join('`, `')}\`` : ''}\n${command.config.cooldown >= 1 ? `**Cooldown:** ${command.config.cooldown} seconds` : '**Cooldown:** None!'}\n\u200b`);
            embed.setFooter('<  > : Angle bracket notation means the argument is required.\n[   ] : Square bracket notation means the argument is optional.');

            if (command.help.examples) {
                for(let index = 0; index < command.help.examples.length; index++) {
                    if (typeof command.help.examples[index] === 'string') {
                        embed.addField(`Example ${index + 1}`, `\`\`\`${command.help.examples[index].replace(/`/g, '"')}\`\`\``, true);
                    }
                }
            }

        }

    }

    message.channel.send(embed);

};

exports.config = {
    enabled: true,
    required: false,
    aliases: ['h', 'halp', 'commands', 'cmds'],
    permLevel: 'User',
    cooldown: -1,
    clientPermissions: ['EMBED_LINKS'],
    userPermissions: []
};

exports.help = {
    name: 'help',
    category: 'System',
    shortDescription: 'Displays all commands available to your permission level.',
    longDescription: 'Displays all commands available to your permission level. Use thing command with a command category or command name to get detailed information about that specific command/category.',
    usage: 'help [command/category]',
    examples: [
        'help system (<= category, short descriptions)',
        'help rank (<= command, long description and details)',
        'help options settings'
    ]
};

exports.args = {
    required: [],
    optional: [
        {
            index: 0,
            name: 'Command / Category / Options',
            options: [
                'Any of the commands',
                'Any category of commands',
                '"Options" to see a list of all available options for a command'
            ],
            flexible: true
        }, {
            index: 1,
            name: 'Command name => Only when calling "options" as your first argument',
            options: [
                'Any command name'
            ],
            flexible: true
        }
    ],
    flags: []
};
