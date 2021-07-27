const { MessageEmbed, MessageAttachment } = require('discord.js');
exports.run = async ({ client, message }) => {

    let str = '';

    client.guilds.cache.forEach(guild => {
        str += `${guild.id} => ${guild.name}\n`;
    });

    if (str.length < 2000) {
        const serverListEmbed = new MessageEmbed()
        .setColor(client.extras.primaryEmbedColor)
        .setDescription(str)
        .setFooter(`${client.guilds.cache.size} servers!`);
        message.channel.send(serverListEmbed);
    } else {
        const output = new MessageAttachment(Buffer.from(str), 'serverList.txt');
        message.channel.send(output);
    }

};

exports.config = {
    enabled: true,
    required: true,
    aliases: ['sl'],
    permLevel: 'Developer',
    cooldown: -1,
    clientPermissions: ['EMBED_LINKS', 'ATTACH_FILES'],
    userPermissions: []
};

exports.help = {
    name: 'serverlist',
    category: 'Developer',
    shortDescription: 'Displays a list of all the servers the bot is in.',
    longDescription: 'Displays a list of all the servers the bot is in. If the list exceeds max. character size a .txt file will be sent.',
    usage: '<command>',
    examples: []
};

exports.args = {
    required: [],
    optional: [],
    flags: []
};
