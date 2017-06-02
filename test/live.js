const test = require('tape')
const romwod = require('../lib/index')
const authPath = require('../lib/auth-path')

/* istanbul ignore next */
const notCalled = (t) => {
  /* istanbul ignore next */
  return (err) => {
    t.ok(false, err instanceof Error ? err.message : 'should not be called')
    t.end()
  }
}
const cookie = authPath
const keys = ['slug', 'id', 'title', 'description', 'duration', 'poses', 'exercises', 'target_areas']

test('it works making a live request', (t) => {
  romwod({ name: 'going the distance', cookie })
    .then((data) => {
      t.deepEqual(Object.keys(data), keys)
      t.end()
    })
    .catch(notCalled(t))
})

test('it works with a single date', (t) => {
  romwod({ date: '2017-02-22', cookie })
    .then((data) => {
      t.deepEqual(Object.keys(data), keys)
      t.end()
    })
    .catch(notCalled(t))
})

test('it works with a single date and no cookie', (t) => {
  romwod({ date: '2017-02-22' })
    .then((data) => {
      t.deepEqual(Object.keys(data), keys)
      t.end()
    })
    .catch(notCalled(t))
})

test('it works with a week', (t) => {
  romwod({ week: '2017-02-22', cookie })
    .then((data) => {
      t.deepEqual(Object.keys(data), ['id', 'start_date', 'end_date', 'slug', 'title', 'scheduled_workouts'])
      data.scheduled_workouts.forEach((w) => t.deepEqual(Object.keys(w), ['date', ...keys]))
      t.end()
    })
    .catch(notCalled(t))
})

test('it works with a week and no cookie', (t) => {
  romwod({ week: '2017-02-22' })
    .then((data) => {
      t.deepEqual(Object.keys(data), ['id', 'start_date', 'end_date', 'slug', 'title', 'scheduled_workouts'])
      data.scheduled_workouts.forEach((w) => t.deepEqual(Object.keys(w), ['date', ...keys]))
      t.end()
    })
    .catch(notCalled(t))
})
