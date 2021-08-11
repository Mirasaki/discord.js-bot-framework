const { stripIndents } = require('common-tags')
const { version, MessageEmbed } = require('discord.js')
exports.run = async ({ client, interaction, guildSettings, args, emojis }) => {
  const latency = Math.round(client.ws.ping)
  interaction.reply({
    embeds: [
      new MessageEmbed()
        .setColor(client.json.colors.main)
        .setAuthor(client.user.tag, client.user.displayAvatarURL())
        .setDescription(stripIndents`**📊 I've been online for ${
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
        **API Latency:** ${
          latency <= 150
          ? `${emojis.connection.good}`
          : latency <= 250
            ? `${emojis.connection.average}`
            : `${emojis.connection.bad}`
        } ${latency} ms
      `)
    ]
  })
}

exports.config = {
  enabled: true,
  required: false,
  permLevel: 'User',
  clientPermissions: [],
  userPermissions: [],
  throttling: {
    usages: 1,
    duration: 30
  }
}

exports.slash = {
  description: 'Displays bot information',
  enabled: true,
  reload: false,
  globalCommand: true,
  testCommand: false,
  serverIds: [],
  options: [],
  listeners: []
}
