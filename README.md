romwod
--------------

Get some information about a ROMWOD workout.

[![NPM](https://nodei.co/npm/@lukekarrys/romwod.png)](https://nodei.co/npm/@lukekarrys/romwod/)
[![Build Status](https://travis-ci.org/lukekarrys/romwod.png?branch=master)](https://travis-ci.org/lukekarrys/romwod)


## Install

```sh
npm install romwod --save
# for the cli
npm install romwod --global
```

## Usage

One of `name`, `date`, or `week` is required, and the auth `cookie` is required if `name` is used.

The `name`, `date`, and `week` parameters will all be correctly formatted to match the URLs.

### JS

```js
require('romwod')({
  // The name of the workout (will be dashified)
  name: 'workout name',
  // You can also lookup a workout by
  date: '2017-02-22',
  // or get a weeks worth of workout for the date (monday-saturday)
  week: '2017-02-22',
  // How long to try the request
  timeout: 10000,
  // Cookie can also be a path to a file containing the id and session like `$ID\n$SESSION`
  cookie: {
    id: '123',
    session: 'ABC456'
  }
})
.then((data) => console.log(data))
.catch((err) => console.error(err))

/* {
  title: 'Workout Name',
  description: 'Something about the workout',
  target_areas: ['Area 1', 'Area 2'],
  poses: ['Pose 1', 'Pose 2'],
  duration: 930.4 // in seconds
} */
```

### CLI

```sh
ID='123'
SESSION='ABC456'

# Get workouts by name, date, or week
romwod name 'the name' $ID $SESSION  --timeout 10000
romwod date '2017-02-22' $ID $SESSION --timeout 10000
romwod week '2017-02-22' $ID $SESSION --timeout 10000

# You may also want to save your cookie for later
romwod auth $ID $SESSION
# And then you can just do
romwod name 'Workout name'

# If you have your auth cookie saved you can omit the date for the date/week commands
# These will show the workout(s) for the current date
romwod date
romwod week

# The default output is encoded JSON, but you can generate nice report format with
romwod date --report
```


## Getting your Cookie

In Chrome, you can look them up in `Developer Tools > Application > Storage > Cookies`.

The required cookies are `_romwod_session` and `_session_id`. 


## Updates

This was written to (hopefully) easily allow for changes in the data structure. All of the parsers are pluggable and in a [separate file](./lib/parsers.js). And the tests are all written with `nock` using previously known valid data.

There is one test file that doesn't get run automatically since it makes live requests, but it can be run separately with `npm run test:live`. It expects for you to have already run `romwod auth YOUR_COOKIE` previously. If that command is not passing, then mostly the parsers will be need to be updated and known good data will need to be copied to [the fixtures](./test/fixtures).


## LICENSE

MIT
