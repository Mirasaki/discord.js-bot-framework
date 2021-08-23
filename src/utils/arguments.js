const yesReplies = ['yes', 'yah', 'yep', 'ya', 'yeah', 'true', 'enable', 'enabled', '1', '+'];
const noReplies = ['no', 'nah', 'nope', 'false', 'disable', 'disabled', '0', '-'];
module.exports.getCoreBoolean = (text) => {
  if (typeof text !== 'string') return undefined;
  else if (yesReplies.find(v => v === text)) return true;
  else if (noReplies.find(v => v === text)) return false;
  else return undefined;
};

module.exports.resolveId = async (guild, snowflake) => {
  try {
    return (
      guild.roles.cache.get(snowflake)
      || guild.channels.cache.get(snowflake)
      || guild.members.cache.get(snowflake)
      || await guild.members.fetch(snowflake)
    );
  } catch {
    return null;
  }
};

module.exports.humanTimeToMS = (input, min, max) => {
  let ms = 0;
  input.match(/[0-9]+[wdhms]/ig)
    .forEach(element => {
      let multiplier;
      switch (element.slice(-1, element.length)) {
        case 's': multiplier = 1000; break;
        case 'm': multiplier = 1000 * 60; break;
        case 'h': multiplier = 1000 * 60 * 60; break;
        case 'd': multiplier = 1000 * 60 * 60 * 24; break;
        case 'w': multiplier = 1000 * 60 * 60 * 24 * 7; break;
        default: break;
      }
      ms += parseInt(element.slice(0, -1)) * multiplier;
    });
  return ms.toString();
};
