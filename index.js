let path = null
let pathMatches = null
let query = null
let route = null

export default function routeData (state) {
  if (route !== state.route) {
    route = state.route
    path = query = null
  }

  return {
    get path () {
      if (path && state.route === route) return path

      if (!pathMatches) this._buildMatches()
      const found = Object.keys(pathMatches).find(match => {
        return new RegExp(match, 'g').test(state.route)
      })
      const matched = pathMatches[found]
      if (!matched) return {}

      const values = state.route.match(matched.regex).slice(1)
      path = matched.vars.reduce((v, p, i) => {
        return Object.defineProperty(v, p, {
          get () { return values[i] },
          set: this._pathSetter(matched, p)
        })
      }, {})
      return path
    },

    get query () {
      if (query && state.route === route) return query

      const search = document.location.search
      if (!search) return {}

      const pairs = search.slice(1).split('&')
      query = pairs.reduce((q, p) => {
        const [key, value] = p.split('=')
        return Object.defineProperty(q, key, {
          get () { return value },
          set: this._querySetter(key, value)
        })
      }, {})
      return query
    },

    _buildMatches: function () {
      const FIND_ROUTE_VAR = new RegExp('(:\\w+)', 'g')
      const REPL_ROUTE_VAR = '(\\w+)'

      if (state.routes) {
        pathMatches = state.routes.reduce((matches, path) => {
          const vars = (path.match(FIND_ROUTE_VAR) || []).map(v => v.slice(1))
          const regex = path.replace(FIND_ROUTE_VAR, REPL_ROUTE_VAR)
          matches[regex] = { path, regex, vars }
          return matches
        }, {})
      } else {
        pathMatches = {}
      }
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
