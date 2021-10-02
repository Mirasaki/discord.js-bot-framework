const { readdirSync, statSync } = require('fs');
const nodePath = require('path');
const { Permissions } = require('discord.js');
const moment = require('moment');

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
    permissions: getPermFlags(require('../../config/permissions.json').defaultRequiredPermissions),
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

module.exports.getRelativeTime = (date) => moment(date).fromNow();

module.exports.wait = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

module.exports.getReply = async (targetId, channel, question, limit = 120000) => {
  const filter = m => m.author.id === targetId;
  await channel.send({
    content: question
  });
  try {
    const collected = await channel.awaitMessages({ filter, max: 1, time: limit, errors: ['time'] });
    return collected.first().content;
  } catch (e) {
    return false;
  }
};
