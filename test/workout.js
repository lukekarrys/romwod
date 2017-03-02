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

const WORKOUT = 'going the distance'
const WORKOUT_ID = 'going-the-distance'
const COOKIE_PATH = path.resolve(__dirname, 'fixtures', 'cookie')
const COOKIE = fs.readFileSync(COOKIE_PATH).toString()
const LOGGED_IN = fs.readFileSync(path.resolve(__dirname, 'fixtures', 'going-the-distance.html')).toString()

const SUCCESS_EXPECTED = {
  slug: 'going-the-distance',
  id: 267,
  title: 'Going the Distance',
  duration: 1528.6,
  description: 'A four minute saddle and five minute straddle await you in todays routine for your hips, IT band, groin, knees, spine, ankles, glutes, quads, shoulders, upper and lower back.',
  exercises: [],
  poses: [
    'Saddle Archer',
    'Saddle',
    'Seated Forward Fold',
    'Bound Angle',
    'Seated Straddle'
  ],
  target_areas: [
    'Ankles',
    'Groin',
    'Upper Back',
    'Shoulders',
    'Quads',
    'Lower Back',
    'IT Band',
    'Hips',
    'Hamstrings',
    'Glutes',
    'Spine',
    'Knees'
  ]
}

const mock = (body = LOGGED_IN) => nock('https://app.romwod.com', { reqheaders: { Cookie: COOKIE.trim() } })
  .get(`/workout/${WORKOUT_ID}`)
  .delay(1000)
  .reply(200, `<!doctype html><html><head></head><body>${body}</body></html>`)

test('it works', (t) => {
  mock()
  romwod({ name: WORKOUT, cookie: COOKIE })
    .then((data) => {
      t.deepEqual(data, SUCCESS_EXPECTED)
      nockOk(t)
      t.end()
    })
    .catch(notCalled(t))
})

test('fails on timeout', (t) => {
  mock()
  romwod({ name: WORKOUT, cookie: COOKIE, timeout: 500 })
    .then(notCalled(t))
    .catch((err) => {
      t.equal(err.message, 'request canceled by user')
      nockOk(t)
      t.end()
    })
})

test('fails without anything', (t) => {
  romwod()
    .then(notCalled(t))
    .catch((err) => {
      t.equal(err.message, 'one of name,date,week is required')
      nockOk(t)
      t.end()
    })
})

test('fails without a name', (t) => {
  romwod({ cookie: COOKIE })
    .then(notCalled(t))
    .catch((err) => {
      t.equal(err.message, 'one of name,date,week is required')
      nockOk(t)
      t.end()
    })
})

test('fails with no html', (t) => {
  mock('<div></div>')
  romwod({ name: WORKOUT, cookie: COOKIE })
    .then(notCalled(t))
    .catch((err) => {
      t.equal(err.message, 'video data could not be found')
      nockOk(t)
      t.end()
    })
})

test('fails with bad html', (t) => {
  mock('<div data-react-class="VideoView"></div>')
  romwod({ name: WORKOUT, cookie: COOKIE })
    .then(notCalled(t))
    .catch((err) => {
      t.equal(err.message, 'video data could not be found')
      nockOk(t)
      t.end()
    })
})

test('fails with bad html prop', (t) => {
  mock('<div data-react-class="VideoView" data-react-props="helpme"></div>')
  romwod({ name: WORKOUT, cookie: COOKIE })
    .then(notCalled(t))
    .catch((err) => {
      t.equal(err.message, 'video data could not be found')
      nockOk(t)
      t.end()
    })
})

test('fails with undocumented parser option throwing an error', (t) => {
  mock('')
  romwod({ name: WORKOUT, cookie: COOKIE, parser: () => JSON.parse('hello') })
    .then(notCalled(t))
    .catch((err) => {
      t.equal(err.message, 'video data could not be found')
      nockOk(t)
      t.end()
    })
})
