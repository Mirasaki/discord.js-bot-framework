const { Schema, model } = require('mongoose');
const requiredString = { type: String, required: true };
const throttleSchema = Schema({
  _userId: requiredString,
  _command: requiredString,
  _usages: { type: Array, required: true }
});

const ThrottleModel = model('throttle', throttleSchema);
module.exports.ThrottleModel = ThrottleModel;

module.exports.throttleCommand = async (client, _userId, cmd) => {
  if (!cmd || typeof cmd !== 'object') throw new TypeError('An invalid command was provided');
  const { config } = cmd;
  const { cooldown } = config;
  if (cooldown === false) return false;
  const cmdName = config.data.name;
  const cmdCd = parseInt(cooldown.duration * 1000);
  if (!cmdCd || cmdCd < 0) return false;
  let data = await ThrottleModel.findOne({ _userId, _command: cmdName });
  if (!data) {
    data = await new ThrottleModel({ _userId, _command: cmdName, _usages: [Date.now()] });
    await data.save();
    return false;
  } else {
    const nonExpired = data._usages.filter((timestamp) => Date.now() < (timestamp + cmdCd));
    data._usages = nonExpired;
    if (nonExpired.length >= cooldown.usages) {
      return `${client.json.emojis.response.error} {{user}}, you can use **\`${config.data.name}\`** again in ${
        Number.parseFloat(((nonExpired[0] + cmdCd) - Date.now()) / 1000).toFixed(2)
      } seconds`;
    } else {
      data._usages.push(Date.now());
      await data.save();
    }
  }
};
