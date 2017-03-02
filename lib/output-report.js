const outdent = require('outdent')
const wrap = require('word-wrap')
const moment = require('moment')

const WIDTH = 80
const INDENT = 2
const NEWLINE = '\n'

const minSec = (duration) => {
  const m = Math.floor(duration / 60)
  const seconds = duration - (m * 60)
  const s = Math.floor(seconds)
  return `${m}:${s.toString().length === 1 ? `0${s}` : s}`
}

const dateFormat = (val) => moment(val).utc().format('ddd MMM D')

const title = (str) => str
  .replace(/_/g, ' ')
  .split(' ')
  .map((c) => `${c.charAt(0).toUpperCase()}${c.slice(1)}`)
  .join(' ')

const center = (str) => {
  const len = str.length
  const side = Math.floor((WIDTH - len) / 2)
  return ' '.repeat(side) + str + ' '.repeat(WIDTH - len - side)
}

const bars = (title) => outdent`
  ${'-'.repeat(WIDTH)}
  ${center(title)}
  ${'-'.repeat(WIDTH) + NEWLINE}
`

const list = (obj, key) => {
  const arr = obj[key]
  if (!arr.length) return ''
  return NEWLINE.repeat(2) + outdent`
    ${title(key)}
    ${'-'.repeat(WIDTH / 4)}
    ${arr.map((i) => '- ' + i).join(NEWLINE)}
  `
}

const workout = (workout) => {
  const date = workout.date
  const title = `${workout.title} (${minSec(workout.duration)})${date ? ` - ${dateFormat(date)}` : ''}`
  const body = workout.description + list(workout, 'poses') + list(workout, 'exercises') + list(workout, 'target_areas')
  return bars(title) + NEWLINE + wrap(body, { width: WIDTH - (INDENT * 2), indent: ' '.repeat(INDENT) })
}

module.exports = (data) => {
  const output = []

  if (data.scheduled_workouts) {
    output.push(bars(data.title))
    output.push(data.scheduled_workouts.map(workout).join(NEWLINE.repeat(2)))
  } else {
    output.push(workout(data))
  }

  return NEWLINE + output.join(NEWLINE) + NEWLINE
}
