const { resolve } = require('path')
const { readdirSync, statSync } = require('fs')

// getFiles() ignores javascript files that start with "."
module.exports.getFiles = (path, extension) => {
  let res = []
  readdirSync(path).forEach((itemInDir) => {
    itemInDir = resolve(path, itemInDir)
    const stat = statSync(itemInDir)
    if (stat.isDirectory()) res = res.concat(this.getFiles(itemInDir, extension))
    if (
      stat.isFile()
      && itemInDir.endsWith(extension)
      && !itemInDir.slice(
        itemInDir.lastIndexOf('\\') + 1, itemInDir.length
      ).startsWith('.')
    ) res.push(itemInDir)
  })
  return res
}

module.exports.titleCase = (str) => {
  if (typeof str !== 'string') throw new TypeError('Expected type: String')
  str = str.toLowerCase().split(' ')
  for (let i = 0; i < str.length; i++) str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1)
  return str.join(' ')
}
