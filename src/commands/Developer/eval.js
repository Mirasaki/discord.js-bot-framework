const { MessageEmbed, MessageAttachment } = require('discord.js');
const { inspect } = require('util');

exports.run = async ({ client, message, guildSettings }) => {

    let evaled;

    try {

        const startTime = process.hrtime();

        const input = client.getInput(message, guildSettings);
        const code = input.replace(/[“”]/g, '"').replace(/[‘’]/g, '\'').replace(/```js/g, '').replace(/```/g, '');
        evaled = eval(code);

        if (evaled instanceof Promise) {
            evaled = await evaled;
        }

        const stopTime = process.hrtime(startTime);

        const response = [
            `**Output:** \`\`\`js\n${clean(inspect(evaled, { depth: 0 }))}\`\`\``,
            `\`\`\`fix\n${(((stopTime[0] * 1e9) + stopTime[1])) / 1e6}ms\`\`\``
        ];

        const evalEmbed = new MessageEmbed()
        .setColor(client.extras.primaryEmbedColor)
        .setDescription(response[0])
        .addField('Time Taken', response[1], true);

        if (response[0].length <= 2000) {
            message.channel.send(evalEmbed);
        } else {
            const output = new MessageAttachment(Buffer.from(response.join('\n')), 'evalOutput.txt');
            message.channel.send(output);
        }


    } catch(err) {
        return message.channel.send(`Error: \`\`\`xl\n${clean(err)}\`\`\``);
    }

};

exports.config = {
    enabled: true,
    required: false,
    aliases: [],
    permLevel: 'Developer',
    cooldown: -1,
    clientPermissions: ['EMBED_LINKS', 'ATTACH_FILES'],
    userPermissions: []
};

exports.help = {
    name: 'eval',
    category: 'Developer',
    shortDescription: 'Evaluates arbitrary javascript code.',
    longDescription: 'Evaluates arbitrary javascript code. Potentially dangerous command, especially in the wrong hands.',
    usage: '<command> <code>',
    examples: [
        'eval message.guild.id',
        'eval Math.floor(Math.random() * (100 - 1)) + 1;',
        'eval message.roles.cache.get(message.guild.id)',
        'In this example, grave accents get replaced by "/quotation marks\n\neval ```js\nconst { guild,  channel } = message;\nconst { roles } = guild;\nconst everyone = roles.cache.get(guild.id);\nchannel.send(`${guild.name} counts ${roles.cache.size} roles counted across ${everyone.members.size} members!`);```'
    ]
};

exports.args = {
    required: [
        {
            index: 0,
            name: 'Code',
            options: ['Arbitrary Javascript code'],
            flexible: true
        }
    ],
    optional: [],
    flags: []
};

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
