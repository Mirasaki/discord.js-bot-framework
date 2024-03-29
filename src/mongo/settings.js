const { Schema, model } = require('mongoose');
const TIME_IN_ONE_HOUR = 1000 * 60 * 60;

const settingSchema = Schema({
  _guildId: { type: String, required: true },
  permissions: {
    modRole: { type: String, default: null },
    adminRole: { type: String, default: null },
    permissionNotice: { type: Boolean, default: true }
  },
  channels: {
    modLog: { type: String, default: null },
    restrictCmds: { type: String, default: null }
  },
  disabledCmds: { type: Array, default: [] }
});

const GuildModel = model('settings', settingSchema);
module.exports.GuildModel = GuildModel;

module.exports.settingsCache = new Map();

module.exports.getSettingsCache = async (guildId) => {
  let data = this.settingsCache.get(guildId);
  if (!this.settingsCache.has(guildId)) {
    const guildSettings = await getSettingsFromDB(guildId);
    data = guildSettings;
    this.settingsCache.set(guildId, data);
  }
  setTimeout(() => {
    this.settingsCache.delete(guildId);
  }, TIME_IN_ONE_HOUR);
  return data;
};

const getSettingsFromDB = async (_guildId) => {
  let guildSettings;
  try {
    guildSettings = await GuildModel.findOne({ _guildId });
    guildSettings ??= await new GuildModel({ _guildId }).save();
  } catch (err) {
    return console.log(err);
  }
  return guildSettings;
};
