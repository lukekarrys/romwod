const test = require('tape')
const nock = require('nock')
const path = require('path')
const fs = require('fs')
const romwod = require('../lib/index')

/* istanbul ignore next */
const notCalled = (t) => (err) => {
  t.ok(false, err instanceof Error ? err.message : 'should not be called')
  t.end()
}

const nockOk = (t) => {
  t.equal(nock.activeMocks().length, 0)
  t.equal(nock.pendingMocks().length, 0)
  t.ok(nock.isDone())
}

const date = '2017-02-22'
const week = '2017-02-22'
const weekPath = 'february-20-february-26-2017'
const COOKIE = fs.readFileSync(path.resolve(__dirname, 'fixtures', 'cookie')).toString()
const LOGGED_IN = fs.readFileSync(path.resolve(__dirname, 'fixtures', weekPath + '.html')).toString()

const DATE_EXPECTED = {
  slug: 'ankles-to-shoulders',
  id: 5,
  title: 'Ankles to Shoulders',
  description: 'We are building from the ground up today with stretches for everything from the ankles to the shoulders.',
  duration: 1412.68,
  poses: [
    'Saddle Eagle',
    'Fragon',
    'Low Dragon',
    'Lizard',
    'Extended Arm Lizard'
  ],
  exercises: [],
  target_areas: [
    'Groin',
    'Lower Back',
    'IT Band',
    'Hips',
    'Hamstrings',
    'Glutes'
  ]
}

const WEEK_EXPECTED = {
  id: 2,
  start_date: '2017-02-20',
  end_date: '2017-02-26',
  slug: 'february-20-february-26-2017',
  title: 'February 20 - February 26, 2017'
}

const mock = (workoutPath = weekPath, cookie = COOKIE.trim()) => nock('https://app.romwod.com', { [cookie ? 'reqheaders' : '']: { Cookie: cookie } })
  .get(`/wod/${workoutPath}`)
  .delay(1000)
  .reply(200, `<!doctype html><html><head></head><body>${LOGGED_IN}</body></html>`)

test('it works with a date', (t) => {
  mock()
  romwod({ date, cookie: COOKIE })
    .then((data) => {
      t.deepEqual(data, DATE_EXPECTED)
      nockOk(t)
      t.end()
    })
    .catch(notCalled(t))
})

test('it works without a cookie', (t) => {
  mock(void 0, '')
  romwod({ date })
    .then((data) => {
      t.deepEqual(data, DATE_EXPECTED)
      nockOk(t)
      t.end()
    })
    .catch(notCalled(t))
})

test('it works with a week', (t) => {
  mock()
  romwod({ week, cookie: COOKIE })
    .then((data) => {
      const workouts = data.scheduled_workouts
      delete data.scheduled_workouts
      t.deepEqual(data, WEEK_EXPECTED)
      t.deepEqual(workouts[2], Object.assign({ date: date + 'T00:00:00.000Z' }, DATE_EXPECTED))
      t.equal(workouts.length, 7)
      nockOk(t)
      t.end()
    })
    .catch(notCalled(t))
})

test('it works with a week date on a sunday', (t) => {
  mock()
  romwod({ week: '2017-02-26', cookie: COOKIE })
    .then((data) => {
      const workouts = data.scheduled_workouts
      delete data.scheduled_workouts
      t.deepEqual(data, WEEK_EXPECTED)
      t.deepEqual(workouts[2], Object.assign({ date: date + 'T00:00:00.000Z' }, DATE_EXPECTED))
      t.equal(workouts.length, 7)
      nockOk(t)
      t.end()
    })
    .catch(notCalled(t))
})

test('it works with a week over a year boundary', (t) => {
  mock('december-26-2016-january-1-2017')
  romwod({ week: '2016-12-29', cookie: COOKIE })
    .then((data) => {
      t.equal(data.scheduled_workouts.length, 7)
      nockOk(t)
      t.end()
    })
    .catch(notCalled(t))
})
