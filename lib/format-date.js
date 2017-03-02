const moment = require('moment')

module.exports.url = (val) => {
  const m = moment(val).utc()
  const d = m.day()
  const start = m.clone().day(d === 0 ? -6 : 1)
  const end = m.clone().day(d === 0 ? 0 : 7)
  const sameYear = start.isSame(end, 'year')
  return `${start.format(`MMMM-D${sameYear ? '' : '-YYYY'}`)}-${end.format('MMMM-D-YYYY')}`.toLowerCase()
}

module.exports.day = (val) => moment(val).utc().startOf('day').format('YYYY-MM-DD')
