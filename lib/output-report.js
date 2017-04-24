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

const url = (slug) => `https://app.romwod.com/workout/${slug}`
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
  if (!arr || !arr.length) return ''
  return NEWLINE.repeat(2) + outdent`
    ${title(key)}
    ${'-'.repeat(WIDTH / 4)}
    ${arr.map((i) => '- ' + i).join(NEWLINE)}
  `
}

const markdownList = (obj, key) => {
  const arr = obj[key]
  if (!arr || !arr.length) return ''
  return NEWLINE.repeat(2) + outdent`
    **${title(key)}**
    ${arr.map((i) => '- ' + i).join(NEWLINE)}
  `
}

const workoutReport = (w) => {
  const { date, title, duration, slug, description } = w
  const reportTitle = `${title} (${minSec(duration)})${date ? ` - ${dateFormat(date)}` : ''}`
  const body = url(slug) + NEWLINE.repeat(2) + description + list(w, 'poses') + list(w, 'exercises') + list(w, 'target_areas')
  return bars(reportTitle) + NEWLINE + wrap(body, { width: WIDTH - (INDENT * 2), indent: ' '.repeat(INDENT) })
}

const workoutMarkdown = (w) => {
  const { title, duration, slug, description } = w
  const body = description + markdownList(w, 'poses') + markdownList(w, 'exercises') + markdownList(w, 'target_areas')
  return outdent`
    # ${title} // ROMWOD

    ${url(slug)}

    ${minSec(duration)}

    ${body}
  `
}

module.exports = (data, options) => {
  const output = []
  let renderer

  if (options.markdown) renderer = workoutMarkdown
  else renderer = workoutReport

  if (data.scheduled_workouts) {
    output.push(bars(data.title))
    output.push(data.scheduled_workouts.map(renderer).join(NEWLINE.repeat(2)))
  } else {
    output.push(renderer(data))
  }

  return NEWLINE + output.join(NEWLINE) + NEWLINE
}
