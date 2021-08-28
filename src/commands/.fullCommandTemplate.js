const Command = require("../classes/Command");

module.exports = new Command(() => {

}, {
  // Permissions
  permLevel: null,
  clientPermissions: [],
  userPermissions: [],

  // Status
  enabled: true,
  required: true,
  nsfw: false,

  // Command Cooldown
  cooldown: {
    usages: 1,
    duration: 2
  },

  // Command State
  globalCommand: false,
  testCommand: true,
  serverIds: [],

  // Slash Command data
  data: {
    name: null,
    description: null,
    options: [],
    defaultPermission: true,
  },

});
