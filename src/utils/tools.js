const { readdirSync, statSync } = require('fs');
const nodePath = require('path');
const { Permissions } = require('discord.js');

// getFiles() ignores files that start with "."
module.exports.getFiles = (path, extension) => {
  if (!nodePath.isAbsolute(path)) path = nodePath.resolve(path);
  let res = [];
  for (let itemInDir of readdirSync(path)) {
    itemInDir = nodePath.resolve(path, itemInDir);
    const stat = statSync(itemInDir);
    if (stat.isDirectory()) res = res.concat(this.getFiles(itemInDir, extension));
    if (
      stat.isFile()
      && itemInDir.endsWith(extension)
      && !itemInDir.slice(
        itemInDir.lastIndexOf(nodePath.sep) + 1, itemInDir.length
      ).startsWith('.')
    ) res.push(itemInDir);
  }
  return res;
};

module.exports.getBotInvite = (client) => {
  return client.generateInvite({
    permissions: getPermFlags(require('../../config/config.json').permissions.defaultRequiredPermissions),
    scopes: ['bot', 'applications.commands'],
    disableGuildSelect: false
  });
};

const getPermFlags = (perms) => {
  if (typeof perms === 'string') perms = [perms];
  const final = [];
  for (const perm of perms) {
    if (Permissions.FLAGS[perm]) return Permissions.FLAGS[perm];
  }
  return final;
};

module.exports.titleCase = (str) => {
  if (typeof str !== 'string') throw new TypeError('Expected type: String');
  str = str.toLowerCase().split(' ');
  for (let i = 0; i < str.length; i++) str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
  return str.join(' ');
};

module.exports.parseSnakeCaseArray = (arr) => {
  return arr.map((perm) => {
    perm = perm.toLowerCase().split(/[ _]+/);
    for (let i = 0; i < perm.length; i++) perm[i] = perm[i].charAt(0).toUpperCase() + perm[i].slice(1);
    return perm.join(' ');
  }).join('\n');
};

module.exports.getTimeSince = (date) => {
  const diff = Date.now() - date;
  const TIME_IN_A_MINUTE = 1000 * 60;
  const TIME_IN_AN_HOUR = TIME_IN_A_MINUTE * 60;
  const TIME_IN_A_DAY = TIME_IN_AN_HOUR * 24;
  const TIME_IN_A_WEEK = TIME_IN_A_DAY * 7;
  const TIME_IN_A_MONTH = TIME_IN_A_DAY * 30.5;
  const TIME_IN_A_YEAR = TIME_IN_A_MONTH * 12;

  const formatResult = (number, unit) => {
    return `${
      number === 1
        ? `1 ${unit} `
        : `${
          number === 0
            ? ''
            : `${number} ${unit}s `
        }`
    }`;
  };

  if (diff > TIME_IN_A_YEAR) {
    return `${
      formatResult(Math.floor(diff / TIME_IN_A_YEAR), 'Year')
    }${
      formatResult(Math.floor((diff % TIME_IN_A_YEAR) / TIME_IN_A_MONTH), 'Month')
    }${
      formatResult(Math.floor(((diff % TIME_IN_A_YEAR) % TIME_IN_A_MONTH) / TIME_IN_A_WEEK), 'Week')
    }${
      formatResult(Math.floor((((diff % TIME_IN_A_YEAR) % TIME_IN_A_MONTH) % TIME_IN_A_WEEK) / TIME_IN_A_DAY), 'Day')
    }${
      formatResult(Math.floor(((((diff % TIME_IN_A_YEAR) % TIME_IN_A_MONTH) % TIME_IN_A_WEEK) % TIME_IN_A_DAY) / TIME_IN_AN_HOUR), 'Hour')
    }`.trim();
  } else if (diff > TIME_IN_A_MONTH) {
    return `${
      formatResult(Math.floor(diff / TIME_IN_A_MONTH), 'Month')
    }${
      formatResult(Math.floor((diff % TIME_IN_A_MONTH) / TIME_IN_A_WEEK), 'Week')
    }${
      formatResult(Math.floor(((diff % TIME_IN_A_MONTH) % TIME_IN_A_WEEK) / TIME_IN_A_DAY), 'Day')
    }${
      formatResult(Math.floor((((diff % TIME_IN_A_MONTH) % TIME_IN_A_WEEK) & TIME_IN_A_DAY) / TIME_IN_AN_HOUR), 'Hour')
    }`.trim();
  } else if (diff > TIME_IN_A_WEEK) {
    return `${
      formatResult(Math.floor(diff / TIME_IN_A_WEEK), 'Week')
    }${
      formatResult(Math.floor((diff % TIME_IN_A_WEEK) / TIME_IN_A_DAY), 'Day')
    }${
      formatResult(Math.floor(((diff % TIME_IN_A_MONTH) & TIME_IN_A_WEEK) / TIME_IN_AN_HOUR), 'Hour')
    }`.trim();
  } else if (diff > TIME_IN_A_DAY) {
    return `${
      formatResult(Math.floor(diff / TIME_IN_A_DAY), 'Day')
    }${
      formatResult(Math.floor((diff % TIME_IN_A_DAY) / TIME_IN_AN_HOUR), 'Hour')
    }${
      formatResult(Math.floor(((diff % TIME_IN_A_DAY) % TIME_IN_AN_HOUR) / TIME_IN_A_MINUTE), 'Minute')
    }`.trim();
  } else if (diff > TIME_IN_AN_HOUR) {
    return `${
      formatResult(Math.floor(diff / TIME_IN_AN_HOUR), 'Hour')
    }${
      formatResult(Math.floor((diff % TIME_IN_AN_HOUR) / TIME_IN_A_MINUTE), 'Minute')
    }`.trim();
  } else if (diff > TIME_IN_A_MINUTE) {
    return `${
      formatResult(Math.floor(diff / TIME_IN_A_MINUTE), 'Minute')
    }${
      formatResult(Math.floor((diff % TIME_IN_A_MINUTE) / 1000), 'Second')
    }`.trim();
  } else {
    return `${
      Math.floor(diff / 1000) === 1
        ? '1 Second'
        : `${Math.floor(diff / 1000)} Seconds`
    }`.trim();
  }
};
