const path = require('path')
const envPaths = require('env-paths')
const packageName = require('../package.json').name.replace(/@/g, '').replace(/\//g, '-')

module.exports = path.join(envPaths(packageName).config, 'auth')
