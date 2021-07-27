const Discord = require('discord.js');
exports.run = async ({ client, message, args, guildSettings }) => {
    const time = Date.now();
    const debugEmbed = new Discord.MessageEmbed()
    .setColor(client.extras.primaryEmbedColor)
    .setAuthor(`Debug '${args[0]}' for ${message.guild.name}!`, message.guild.iconURL({ dynamic: true }) || client.extras.defaultImageLink);

    if (args[0] === 'settings') {

        Object.entries(guildSettings).forEach(([key, value]) => {
            if (typeof value === 'object') {
                if (key === 'disabled_cmds') {
                    debugEmbed.addField(`${key}`, `\`\`\`${value.join(', ') || 'None!'}\`\`\``, true);
                } else {
                    Object.entries(value).forEach(([subKey, subValue]) => {
                        debugEmbed.addField(`${subKey}`, `\`\`\`${subValue || ' '}\`\`\``, true);
                    });
                }
            } else {
                debugEmbed.addField(`${key}`, `\`\`\`${value}\`\`\``, true);
            }
        });

        debugEmbed.setFooter(`Time taken: ${Date.now() - time}ms`);
        return message.channel.send(debugEmbed);

    }

};

exports.config = {
    enabled: true,
    required: false,
    aliases: ['db'],
    permLevel: 'Developer',
    cooldown: -1,
    clientPermissions: ['EMBED_LINKS'],
    userPermissions: []
};

exports.help = {
    name: 'debug',
    category: 'Developer',
    shortDescription: 'Database debugging / Shows raw database values.',
    longDescription: 'Database debugging / Shows raw database values. Useful when you have some entries in there which are not displayed in any command.',
    usage: '<command> <database>',
    examples: ['debug settings']
};

exports.args = {
    required: [
        {
            index: 0,
            name: 'Database',
            options: ['settings'],
            flexible: false
        }
    ],
    optional: [],
    flags: []
};
