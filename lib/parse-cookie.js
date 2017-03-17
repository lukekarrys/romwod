const fs = require('fs')

const fileOrValue = (val) => {
  const isString = typeof val === 'string'
  if (isString && fs.existsSync(val)) {
    return fs.readFileSync(val).toString().trim()
  } else if (isString) {
    return val.trim()
  }
  return val
}

const headerCookie = (val) => Object.keys(val).sort().reduce((acc, key) => {
  acc.push(`${key}=${val[key]}`)
  return acc
}, []).join(';')

/*
The cookie value can be
  - A string separated by newline, ; or a space
  - An object with keys idKey and sessionKey (passed in)
  - An array of strings
  - All string values can be just the value or have a `key=` at the front
  - If the string has no key, then the values are sorted based on length
*/
module.exports = (cookie, idKey, sessionKey) => {
  cookie = fileOrValue(cookie)

  if (!cookie) {
    cookie = []
  } else if (!Array.isArray(cookie) && typeof cookie === 'object') {
    cookie = [
      `${idKey}=${cookie[idKey] || cookie.id}`,
      `${sessionKey}=${cookie[sessionKey] || cookie.session}`
    ]
  } else if (typeof cookie === 'string') {
    cookie = cookie.split(['\n', ';', ' '].find((c) => c && cookie.includes(c)))
  } else if (!Array.isArray(cookie)) {
    cookie = []
  }

  cookie = cookie.filter(Boolean).map((v) => v.toString().trim())

  if (cookie.length && cookie.every((c) => c.includes('='))) {
    // If the values have equals signs then return as an object where
    // the keys are whitelisted according to keys argument
    cookie = cookie.reduce((acc, v) => {
      const [key, value] = v.split('=')
      if (key === idKey || key === sessionKey) {
        acc[key] = value
      }
      return acc
    }, {})
  } else {
    // Otherwise its just values, the only thing we know is that id comes first then session
    cookie = cookie.reduce((acc, value, index) => {
      if (index === 0) acc[idKey] = value
      if (index === 1) acc[sessionKey] = value
      return acc
    }, {})
  }

  return {
    obj: cookie,
    string: headerCookie(cookie)
  }
}
