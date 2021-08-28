const { MessageEmbed } = require('discord.js');
const Command = require('../../classes/Command');

module.exports = new Command(async ({ client, interaction, guildSettings, args, emojis }) => {
  let evaled;
  try {
    const startTime = process.hrtime();
    const input = args[0].value;
    const code = input.replace(/[“”]/g, '"').replace(/[‘’]/g, '\'').replace(/```js/g, '').replace(/```/g, '');

    // eslint-disable-next-line no-eval
    evaled = eval(code);
    if (evaled instanceof Promise) evaled = await evaled;
    const stopTime = process.hrtime(startTime);

    const response = [
      `**Output:**\n\`\`\`js\n${clean(require('util').inspect(evaled, { depth: 0 }))}\`\`\``,
      `\`\`\`fix\n${(((stopTime[0] * 1e9) + stopTime[1])) / 1e6}ms\`\`\``
    ];

    const evalEmbed = new MessageEmbed()
      .setColor(client.json.colors.main)
      .setDescription(response[0])
      .addField('Time Taken', response[1], true);

    if (response[0].length <= 2000) {
      interaction.reply({
        embeds: [evalEmbed]
      });
    } else {
      const output = Buffer.from(response.join('\n'));
      interaction.reply({
        content: 'Content too long, output:',
        files: [{
          attachment: output,
          name: 'evalOutput.txt'
        }]
      });
    }
  } catch (err) {
    return interaction.reply({
      content: `Error: \`\`\`xl\n${clean(err.stack || err)}\`\`\``,
      ephemeral: true
    });
  }
}, {
  permLevel: 'Developer',
  clientPermissions: ['ATTACH_FILES', 'EMBED_LINKS'],
  data: {
    description: 'Evaluate Javascript code',
    options: [
      {
        type: 'STRING',
        required: true,
        name: 'code',
        description: 'The Javascript code to execute'
      }
    ]
  }
});

const clean = (text) => {
  if (typeof (text) === 'string') {
    return text.replace(/`/g, '`'
      + String.fromCharCode(8203)).replace(/@/g, '@'
      + String.fromCharCode(8203))
      .replace(new RegExp(process.env.DISCORD_TOKEN), '<token>')
      .replace(new RegExp(process.env.MONGO_LINK), '<dbLink>');
  } else {
    return text;
  }
};
