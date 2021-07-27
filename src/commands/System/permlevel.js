const { getPermissionLevel } = require('../../handlers/permissions');
const Discord = require('discord.js');

exports.run = async ({ client, message }) => {

    const perms = await getPermissionLevel(message);
    const { permissionLevel, permissionName } = perms;

    const permLevelEmbed = new Discord.MessageEmbed()
    .setColor(client.extras.primaryEmbedColor)
    .setDescription(`${message.author.toString()}, your permission level is: __${permissionLevel}__ - **${permissionName}**`);
    message.channel.send(permLevelEmbed);

};

exports.config = {
    enabled: true,
    required: false,
    aliases: [],
    permLevel: 'User',
    cooldown: 30,
    clientPermissions: ['EMBED_LINKS'],
    userPermissions: []
};

exports.help = {
    name: 'permlevel',
    category: 'System',
    shortDescription: 'Tells you your permission level for executing bot commands.',
    longDescription: 'Tells you your permission level for executing bot commands. \n\n0 = User\n1 = Helper\n2 = Moderator\n3 = Administrator\n4 = Server Owner\n5 = Bot Support\n6 = Bot Administrator\n7 = Developer',
    usage: '<command>',
    examples: []
};

exports.args = {
    required: [],
    optional: [],
    flags: []
};
