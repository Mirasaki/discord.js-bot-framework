const { version, MessageEmbed } = require('discord.js')
exports.run = async ({ client, interaction, guildSettings, args }) => {
  interaction.reply({
    embeds: [
      new MessageEmbed()
        .setColor(client.json.colors.main)
        .setAuthor(client.user.tag, client.user.displayAvatarURL())
        .setDescription(`**📊 I've been online for ${
          parseInt((client.uptime / (1000 * 60 * 60 * 24)) % 60, 10)
        } days, ${
          parseInt((client.uptime / (1000 * 60 * 60)) % 24, 10)
        } hours, ${
          parseInt((client.uptime / (1000 * 60)) % 60, 10)
        } minutes and ${
          parseInt((client.uptime / 1000) % 60, 10)
        }.${
          parseInt((client.uptime % 1000) / 100, 10)
        } seconds!**
        \n**Memory Usage:** [${
          (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)
        } MB](https://discord.gg/JPeue456eD)
        **Discord.js Version:** [v${version}](https://discord.js.org/#/docs/main/12.3.1/general/welcome)
        **Node Version:** [${process.version}](https://nodejs.org/docs/latest-v12.x/api/#)
        **API Latency:** ${Math.round(client.ws.ping)}ms
      `)
    ]
  })
}

exports.config = {
  enabled: true,
  required: true,
  permLevel: 'User',
  clientPermissions: [],
  userPermissions: [],
  throttling: {
    usages: 1,
    duration: 5
  }
}

exports.slash = {
  description: 'Displays bot information',
  enabled: true,
  reload: true,
  globalCommand: false,
  testCommand: true,
  serverIds: [],
  options: [],
  listeners: []
}
