const FIND_ROUTE_VAR = new RegExp('(:\\w+)', 'g')
const REPL_ROUTE_VAR = '(\\w+)'

export default function routeData (state) {
  const pathMatches = state.routes.reduce((matches, path) => {
    const vars = (path.match(FIND_ROUTE_VAR) || []).map(v => v.slice(1))
    const regex = path.replace(FIND_ROUTE_VAR, REPL_ROUTE_VAR)
    matches[regex] = { path, regex, vars }
    return matches
  }, {})

  return {
    get path () {
      const found = Object.keys(pathMatches).find(match => {
        return new RegExp(match, 'g').test(state.route)
      })
      const matched = pathMatches[found]
      if (!matched) return {}

      const values = state.route.match(matched.regex).slice(1)
      return matched.vars.reduce((v, p, i) => {
        return Object.defineProperty(v, p, {
          get () { return values[i] },
          set: this._pathSetter(matched, p)
        })
      }, {})
    },

    get query () {
      const search = document.location.search
      if (!search) return search

      const pairs = search.slice(1).split('&')
      return pairs.reduce((q, p) => {
        const [key, value] = p.split('=')
        return Object.defineProperty(q, key, {
          get () { return value },
          set: this._querySetter(key, value)
        })
      }, {})
    },

    _pathSetter: function (match, prop) {
      return value => {
        const path = match.path.replace(new RegExp(`:${prop}`, 'g'), value)
        state.route = path + document.location.search + document.location.hash
      }
    },

    _querySetter: function (prop, prevValue) {
      return value => {
        const search = document.location.search
          .replace(new RegExp(`${prop}=${prevValue}`, 'g'), `${prop}=${value}`)
        state.route =
          document.location.pathname + search + document.location.hash
      }
    }
  }
}
