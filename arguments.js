const yesReplies = ['yes', 'yah', 'yep', 'ya', 'yeah', 'true', 'enable', 'enabled', '1']
const noReplies = ['no', 'nah', 'false', 'disable', 'disabled', '0']
module.exports.getCoreBoolean = (text) => {
  if (typeof text !== 'string') return undefined
  else if (yesReplies.find(v => v === text)) return true
  else if (noReplies.find(v => v === text)) return false
  else return undefined
}

module.exports.getChannel = (query) => { /* channel, role, user, member etc etc */ }
