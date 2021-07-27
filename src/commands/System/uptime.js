const { version, MessageEmbed } = require('discord.js');
exports.run = async ({ client, message }) => {

    const latencyMsg = await message.channel.send('FUS!');
    await latencyMsg.delete();

    let milliseconds = parseInt((client.uptime % 1000) / 100, 10);
    let seconds = parseInt((client.uptime / 1000) % 60, 10);
    let minutes = parseInt((client.uptime / (1000 * 60)) % 60, 10);
    let hours = parseInt((client.uptime / (1000 * 60 * 60)) % 24, 10);
    let days = parseInt((client.uptime / (1000 * 60 * 60 * 24)) % 60, 10);

    const embed = new MessageEmbed()
    .setColor(client.extras.primaryEmbedColor)
    .setAuthor(client.user.tag, client.user.displayAvatarURL())
    .setDescription(`**📊 I've been online for ${days} days, ${hours} hours, ${minutes} minutes and ${seconds}.${milliseconds} seconds!**\n\n**Memory Usage:** ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB\n**Discord.js Version:** v${version}\n**Node Version:** ${process.version}`);
    const msg = await message.channel.send(embed);

    setTimeout(function() {
        milliseconds = parseInt((client.uptime % 1000) / 100, 10);
        seconds = parseInt((client.uptime / 1000) % 60, 10);
        minutes = parseInt((client.uptime / (1000 * 60)) % 60, 10);
        hours = parseInt((client.uptime / (1000 * 60 * 60)) % 24, 10);
        days = parseInt((client.uptime / (1000 * 60 * 60 * 24)) % 60, 10);
        embed.setDescription(`**📊 I've been online for ${days} days, ${hours} hours, ${minutes} minutes and ${seconds}.${milliseconds} seconds!**\n\n**Memory Usage:** [${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB](https://discord.gg/JPeue456eD)\n**Discord.js Version:** [v${version}](https://discord.js.org/#/docs/main/12.3.1/general/welcome)\n**Node Version:** [${process.version}](https://nodejs.org/docs/latest-v12.x/api/#)\n**Server Latency:** ${latencyMsg.createdTimestamp - message.createdTimestamp}ms.\n**API Latency:** ${Math.round(client.ws.ping)}ms`);
        msg.edit(embed);
    }, 1000);

};

exports.config = {
    enabled: true,
    required: false,
    aliases: ['botinfo', 'boti', 'binfo', 'stats', 'botstats', 'ping', 'latency'],
    permLevel: 'User',
    cooldown: 10,
    clientPermissions: ['EMBED_LINKS'],
    userPermissions: []
};

exports.help = {
    name: 'uptime',
    category: 'System',
    shortDescription: 'Displays bot information',
    longDescription: 'Displays bot information. Things like uptime, memory usage, Discord.JS version, latency...',
    usage: '<command>',
    examples: []
};

exports.args = {
    required: [],
    optional: [],
    flags: []
};
