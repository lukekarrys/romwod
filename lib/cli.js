#!/usr/bin/env node

const yargs = require('yargs')
const path = require('path')
const fs = require('fs')
const mkdirp = require('mkdirp')
const romwod = require('./index')
const outputReport = require('./output-report')
const authPath = require('./auth-path')
const RomwodError = require('./romwod-error')

const argv = yargs
  .command({
    command: 'name <name> [cookie..]',
    desc: 'Get a workout by name'
  })

  .command({
    command: 'date [date] [cookie..]',
    desc: 'Get a single workout by date',
    builder: (yargs) => yargs.default('date', new Date())
  })

  .command({
    command: 'week [week] [cookie..]',
    desc: 'Get a list of workouts for this week',
    builder: (yargs) => yargs.default('week', new Date())
  })

  .command({
    command: 'auth <id> <session> [cookiePath]',
    desc: 'Save your cookie to the auth file',
    builder: (yargs) => yargs.default('cookiePath', authPath)
  })

  .demandCommand(1)

  .describe('timeout', 'Timeout in ms')
  .number('timeout')
  .default('timeout', 10000)

  .describe('report', 'Output in report format')
  .boolean('report')
  .default('report', false)

  .help('help')
  .argv

const {
  _: [command],
  cookie,
  id,
  session,
  cookiePath,
  timeout,
  report
} = argv

if (command === 'auth') {
  console.log(`Writing cookie to ${cookiePath}`)
  mkdirp.sync(path.dirname(cookiePath))
  fs.writeFileSync(cookiePath, id + '\n' + session)
} else {
  romwod({
    timeout,
    cookie: cookie.length === 0 ? authPath : (cookie.length === 1 ? cookie[0] : cookie),
    [command]: argv[command]
  })
  .then((obj) => report ? outputReport(obj) : JSON.stringify(obj, null, 0))
  .then(console.log.bind(console))
  .catch((err) => console.error(err instanceof RomwodError ? err.message : err))
}
