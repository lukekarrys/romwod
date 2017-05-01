const jsdom = require('jsdom/lib/old-api')
const attempt = require('lodash.attempt')
const parsers = require('./parsers')
const parseCookie = require('./parse-cookie')
const RomwodError = require('./romwod-error')

module.exports = (options = {}) => new Promise((resolve, reject) => {
  const timeout = options.timeout || 10000

  // Using one of the parsers keys, determine what path and parser to use for the request
  const urlKey = parsers.keys.find((key) => !!options[key])
  if (!urlKey) return reject(new RomwodError(`one of ${parsers.keys.join()} is required`))
  const { parser: defaultParser, path: urlPath } = parsers[urlKey](options[urlKey])

  // Undocumented options for hopefully easier debugging should stuff change
  const urlBase = options.urlBase || 'https://app.romwod.com/'
  const parser = typeof options.parser === 'function' ? options.parser : defaultParser

  // Take required cookie keys and parse cookie value and validate it all
  const idCookieKey = options.idCookieKey || '_session_id'
  const sessionCookieKey = options.sessionCookieKey || '_romwod_session'
  const {obj: cookie, string: headerCookie} = parseCookie(options.cookie, idCookieKey, sessionCookieKey)
  if ((!cookie[idCookieKey] || !cookie[sessionCookieKey]) && urlKey === 'name') {
    return reject(new RomwodError(`cookie keys ${[idCookieKey, sessionCookieKey].join()} are required`))
  }

  // A manual timeout since we rely on behavior within resourceLoader to finish
  const errorTimeout = setTimeout(() => jsdomRequest.abort(), timeout)

  const url = urlBase + urlPath
  const headers = {}
  if (headerCookie) headers.Cookie = headerCookie

  const jsdomRequest = jsdom.env({
    url,
    headers,
    done: (err, window) => {
      clearTimeout(errorTimeout)

      if (err) return reject(err)

      const data = attempt(() => parser(window))
      window.close()

      return !data || data instanceof Error
        ? reject(new RomwodError('video data could not be found'))
        : resolve(data)
    }
  })
})
