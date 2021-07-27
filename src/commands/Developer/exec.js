const { exec } = require('child_process');
const { MessageEmbed, MessageAttachment } = require('discord.js');

exports.run = async ({ client, message, guildSettings }) => {

    const input = client.getInput(message, guildSettings);
    const startTime = process.hrtime();

    exec(input, (err, consoleOutput) => {

        const stopTime = process.hrtime(startTime);

        const execEmbed = new MessageEmbed()
        .setColor(client.extras.primaryEmbedColor)
        .setDescription(`\`\`\`xl\n${consoleOutput || err}\`\`\``)
        .addField('Time Taken', `\`\`\`fix\n${(((stopTime[0] * 1e9) + stopTime[1])) / 1e6}ms\`\`\``, true);

        if (consoleOutput.length <= 2000) {
            message.channel.send(execEmbed);
        } else {
            const output = new MessageAttachment(Buffer.from(consoleOutput), 'execOutput.txt');
            message.channel.send(output);
        }

    });

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
    name: 'exec',
    category: 'Developer',
    shortDescription: 'Executes a console command through Discord.',
    longDescription: 'Executes a console command through Discord. Uses a child process to execute the query. Potentially dangerous command.',
    usage: '<command> <console command>',
    examples: [
        'exec tree',
        'exec node . | Also, don\'t do that.'
    ]
};

exports.args = {
    required: [
        {
            index: 0,
            name: 'Command',
            options: ['Any console command'],
            flexible: true
        }
    ],
    optional: [],
    flags: []
};
