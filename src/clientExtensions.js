const MS_IN_A_DAY = 1000 * 60 * 60 * 24;
module.exports = (client) => {

    client.extras = require('./assets/extras.json');
    client.ids = require('./assets/ids.json');

    client.getInput = (message, guildSettings) => {
        let input = message.content.slice(guildSettings.prefix.length).trim().split(' ');
        input.shift();
        input = input.join(' ');
        return input;
    };

    client.startTime = process.hrtime();

    client.send = (type, message, text) => {
        const typeIcons = {
            'yes': client.extras.yesIcon,
            'no': client.extras.noIcon,
            'wait': client.extras.waitIcon
        };
        if (typeIcons[type] === undefined) console.log('An invaled client.send() type was provided!');
        else message.channel.send(`${typeIcons[type]} ${message.author.toString()}, ` + text);
    };

    client.randomRange = (min, max) => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    client.checkDays = async (date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / MS_IN_A_DAY);
        return `${days} ${days == 1 ? 'day' : 'days'} ago`;
    };

    Object.defineProperty(String.prototype, 'toProperCase', {
        value: function() {
            return this.replace(/([^\W_]+[^\s-]*) */g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
        }
    });

    client.wait = async (delay) => new Promise((resolve) => setTimeout(resolve, delay));

};
