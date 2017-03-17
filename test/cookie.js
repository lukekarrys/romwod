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
const [COOKIE_SESSION, COOKIE_ID] = COOKIE.split(';').map((c) => c.replace(/^.*=(.*)/, '$1').trim())
const UNAUTHED_COOKIE = '_romwod_session=123456;_session_id=123'
const MISSING_KEYS_COOKIE = 'testhuh=what'
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

test('it works with a cookie path', (t) => {
  mock()
  romwod({ name: WORKOUT, cookie: COOKIE_PATH })
    .then((data) => {
      t.deepEqual(data, SUCCESS_EXPECTED)
      nockOk(t)
      t.end()
    })
    .catch(notCalled(t))
})

test('works with cookie obj', (t) => {
  mock()
  romwod({ name: WORKOUT, cookie: { _romwod_session: COOKIE_SESSION, _session_id: COOKIE_ID } })
    .then((data) => {
      t.deepEqual(data, SUCCESS_EXPECTED)
      nockOk(t)
      t.end()
    })
    .catch(notCalled(t))
})

test('works with cookie obj with generic keys', (t) => {
  mock()
  romwod({ name: WORKOUT, cookie: { session: COOKIE_SESSION, id: COOKIE_ID } })
    .then((data) => {
      t.deepEqual(data, SUCCESS_EXPECTED)
      nockOk(t)
      t.end()
    })
    .catch(notCalled(t))
})

test('works with cookie array', (t) => {
  mock()
  romwod({ name: WORKOUT, cookie: [COOKIE_ID, COOKIE_SESSION] })
    .then((data) => {
      t.deepEqual(data, SUCCESS_EXPECTED)
      nockOk(t)
      t.end()
    })
    .catch(notCalled(t))
})

test('it works with just cookie values joined by ;', (t) => {
  mock()
  romwod({ name: WORKOUT, cookie: COOKIE_ID + ';' + COOKIE_SESSION })
    .then((data) => {
      t.deepEqual(data, SUCCESS_EXPECTED)
      nockOk(t)
      t.end()
    })
    .catch(notCalled(t))
})

test('it works with just cookie values joined by newline', (t) => {
  mock()
  romwod({ name: WORKOUT, cookie: COOKIE_ID + '\n' + COOKIE_SESSION })
    .then((data) => {
      t.deepEqual(data, SUCCESS_EXPECTED)
      nockOk(t)
      t.end()
    })
    .catch(notCalled(t))
})

test('it works with just cookie values joined by space', (t) => {
  mock()
  romwod({ name: WORKOUT, cookie: COOKIE_ID + ' ' + COOKIE_SESSION })
    .then((data) => {
      t.deepEqual(data, SUCCESS_EXPECTED)
      nockOk(t)
      t.end()
    })
    .catch(notCalled(t))
})

test('fails with a bad type for a cookie', (t) => {
  romwod({ name: WORKOUT, cookie: 1 })
    .then(notCalled(t))
    .catch((err) => {
      t.equal(err.message, 'cookie keys _session_id,_romwod_session are required')
      nockOk(t)
      t.end()
    })
})

test('fails with a bad type null for a cookie', (t) => {
  romwod({ name: WORKOUT, cookie: null })
    .then(notCalled(t))
    .catch((err) => {
      t.equal(err.message, 'cookie keys _session_id,_romwod_session are required')
      nockOk(t)
      t.end()
    })
})

test('fails with only one value for a a cookie', (t) => {
  romwod({ name: WORKOUT, cookie: COOKIE_SESSION })
    .then(notCalled(t))
    .catch((err) => {
      t.equal(err.message, 'cookie keys _session_id,_romwod_session are required')
      nockOk(t)
      t.end()
    })
})

test('fails with empty values', (t) => {
  romwod({ name: WORKOUT, cookie: ';' })
    .then(notCalled(t))
    .catch((err) => {
      t.equal(err.message, 'cookie keys _session_id,_romwod_session are required')
      nockOk(t)
      t.end()
    })
})

test('fails without a cookie', (t) => {
  romwod({ name: WORKOUT, cookie: '' })
    .then(notCalled(t))
    .catch((err) => {
      t.equal(err.message, 'cookie keys _session_id,_romwod_session are required')
      nockOk(t)
      t.end()
    })
})

test('fails with bad cookie keys', (t) => {
  romwod({ name: WORKOUT, cookie: MISSING_KEYS_COOKIE })
    .then(notCalled(t))
    .catch((err) => {
      t.equal(err.message, 'cookie keys _session_id,_romwod_session are required')
      nockOk(t)
      t.end()
    })
})

test('fails with an unauthed cookie', (t) => {
  romwod({ name: WORKOUT, cookie: UNAUTHED_COOKIE })
    .then(notCalled(t))
    .catch((err) => {
      t.ok(err.message.startsWith('Nock: No match for request'))
      nockOk(t)
      t.end()
    })
})
