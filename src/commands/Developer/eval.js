const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const Command = require('../../classes/Command');
const calledRecently = new Set();

module.exports = new Command(async ({ client, interaction, guildSettings, args, emojis }) => {
  if (calledRecently.has(interaction.channel.id)) {
    return interaction.reply({
      content: `${emojis.response.error} ${interaction.member.toString()}, \`${interaction.commandName}\` is already active in **#${interaction.channel.name}**, please try again later.`,
      ephemeral:  true
    });
  } else calledRecently.add(interaction.channel.id);
  let evaled;
  const input = args[0].value;
  const code = input.replace(/[“”]/g, '"').replace(/[‘’]/g, '\'').replace(/```js/g, '').replace(/```/g, '');

  const { member } = interaction;
  await interaction.reply({
    content: `${emojis.response.wait} ${member.toString()}, are you sure you wish to execute this code?`,
    embeds: [new MessageEmbed()
      .setColor(client.json.colors.error)
      .setDescription(`\`\`\`js\n${parseCodeblock(code)}\`\`\``)
      .setFooter('Temp')
    ],
    components: [
      new MessageActionRow()
        .addComponents(
          new MessageButton({
            label: 'Execute',
            customId: 'eval_01',
            style: 'SUCCESS',
            emoji: '✅'
          }),
          new MessageButton({
            label: 'Cancel',
            customId: 'eval_02',
            style: 'DANGER',
            emoji: '⛔'
          })
        )
    ]
  });

  const filter = i => (i.customId === 'eval_01' || i.customId === 'eval_02') && i.member.id === member.id;
  const collector = interaction.channel.createMessageComponentCollector({ filter, componentType: 'BUTTON', time: 60000, max: 1 });

  collector.on('collect', async i => {
    if (i.customId === 'eval_02') {
      await interaction.editReply({
        content: `${emojis.response.wait} ${member.toString()}, this code block has been discarded.`,
        embeds: [new MessageEmbed()
          .setColor(client.json.colors.error)
          .setDescription(`\`\`\`js\n${parseCodeblock(code)}\`\`\``)
        ],
        components: [
          new MessageActionRow()
            .addComponents(
              new MessageButton({
                label: 'Cancelled',
                customId: 'eval_02',
                style: 'SECONDARY',
                emoji: '⛔',
                disabled: true
              })
            )
        ]
      });
      return i.reply({
        content: `${emojis.response.success} Cancelled the execution of this codeblock.`
      });
    } else {
      await interaction.editReply({
        content: `${emojis.response.wait} ${member.toString()}, this code block has been executed.`,
        embeds: [new MessageEmbed()
          .setColor(client.json.colors.error)
          .setDescription(`\`\`\`js\n${parseCodeblock(code)}\`\`\``)
        ],
        components: [
          new MessageActionRow()
            .addComponents(
              new MessageButton({
                label: 'Executed',
                customId: 'eval_01',
                style: 'SECONDARY',
                emoji: '✅',
                disabled: true
              })
            )
        ]
      });
      const startTime = process.hrtime();
      try {
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
          .setDescription(':outbox_tray: ' + response[0])
          .addField('Time Taken', response[1], true);
    
        if (response[0].length <= 2000) {
          i.reply({
            embeds: [evalEmbed]
          });
        } else {
          const output = Buffer.from(response.join('\n').replace(/`/g, ''));
          i.reply({
            content: 'Content too long, output:',
            files: [{
              attachment: output,
              name: 'evalOutput.js'
            }]
          });
        }
      } catch (err) {
        return i.reply({
          content: `Error: \`\`\`xl\n${clean(err.stack || err)}\`\`\``,
          ephemeral: true
        });
      }
    }
  });
  collector.on('end', () => {
    calledRecently.delete(interaction.channel.id);
  });
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
  } else return text;
};

// Code from: https://github.com/lifeguardbot/lifeguard/blob/a31f57b5164d95d16f0dd961c10a5b77dc9e7bd4/src/plugins/dev/eval.ts#L6-L13
function parseCodeblock (script) {
  const cbr = /^(([ \t]*`{3,4})([^\n]*)([\s\S]+?)(^[ \t]*\2))/gm;
  const result = cbr.exec(script);
  if (result) return result[4];
  return script;
}
