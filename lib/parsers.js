const dashify = require('dashify')
const formatDate = require('./format-date')

const dataParser = (reactClass, transformer) => (w) => {
  const el = w.document.querySelector(`[data-react-class=${reactClass}]`)
  const data = JSON.parse(el.getAttribute('data-react-props'))
  return transformer(data)
}

const videoParser = (video) => ({
  slug: video.slug,
  id: video.id,
  title: video.title,
  description: video.description,
  duration: video.duration_in_seconds,
  poses: video.poses.map((i) => i.content),
  exercises: video.exercises.map((i) => i.content),
  target_areas: video.target_areas.map((i) => i.content)
})

const parsers = {
  name: (value) => ({
    path: `workout/${dashify(value)}`,
    parser: dataParser('VideoView', ({ video }) => videoParser(video))
  }),
  date: (value) => ({
    path: `wod/${formatDate.url(value)}`,
    parser: dataParser('WeeklySchedule', ({ schedule }) => {
      const workout = schedule.scheduled_workouts.find((w) => formatDate.day(w.date) === formatDate.day(value))
      return videoParser(workout.video)
    })
  }),
  week: (value) => ({
    path: `wod/${formatDate.url(value)}`,
    parser: dataParser('WeeklySchedule', ({ schedule }) => ({
      id: schedule.id,
      start_date: schedule.start_date,
      end_date: schedule.end_date,
      slug: schedule.slug,
      title: schedule.title,
      scheduled_workouts: schedule.scheduled_workouts.map((i) => Object.assign({ date: i.date }, videoParser(i.video)))
    }))
  })
}

module.exports = parsers
module.exports.keys = Object.keys(parsers)
