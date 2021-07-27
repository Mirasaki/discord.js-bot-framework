const fetch = require('node-fetch');

exports.run = async ({ client, message, args }) => {

    const discordDocsURL = `https://djsdocs.sorta.moe/v2/embed?src=stable&q=${encodeURIComponent(args.join(' '))}`;

    const docsFetch = await fetch(discordDocsURL);
    const embed = await (await docsFetch).json();

    if (!embed || embed.error) return client.send('no', message, 'that search query didn\'t return any results!');

    message.channel.send({ embed });

};

exports.config = {
    enabled: true,
    required: false,
    aliases: [],
    permLevel: 'Developer',
    cooldown: -1,
    clientPermissions: ['EMBED_LINKS'],
    userPermissions: []
};

exports.help = {
    name: 'docs',
    category: 'Developer',
    shortDescription: 'Searches the docs for your specified query.',
    longDescription: 'Searches the docs for your specified query. Displays the retrieved information (if any) in an embed.',
    usage: '<command> <search query>',
    examples: [
        'docs message#guild',
        'docs client',
        'docs guild#roles',
        'docs rolemanager',
        'docs messagecollector',
        'docs client#ws'
    ]
};

exports.args = {
    required: [
        {
            index: 0,
            name: 'Query',
            options: ['search query'],
            flexible: true
        }
    ],
    optional: [],
    flags: []
};
