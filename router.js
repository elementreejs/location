const FIND_ROUTE_VAR = new RegExp('(:\\w+)', 'g')
const REPL_ROUTE_VAR = '(\\w+)'

export default class Router {
  get path () {
    const found = Object.keys(this._pathMatches).find(match => {
      return new RegExp(match, 'g').test(this._route)
    })
    const matched = this._pathMatches[found]
    if (!matched) return {}

    const values = this._route.match(matched.regex).slice(1)
    return matched.vars.reduce((v, p, i) => {
      return Object.defineProperty(v, p, {
        get () { return values[i] },
        set: this._pathSetter(matched, p)
      })
    }, {})
  }

  get route () {
    return this._route
  }

  set route (current) {
    this._route = current
    if (!this._pathMatches) {
      this._pathMatches = this.routes.reduce((matches, path) => {
        const vars = (path.match(FIND_ROUTE_VAR) || []).map(v => v.slice(1))
        const regex = path.replace(FIND_ROUTE_VAR, REPL_ROUTE_VAR)
        matches[regex] = { path, regex, vars }
        return matches
      }, {})
    }
  }

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
  }

  _pathSetter (match, prop) {
    return value => {
      const path = match.path.replace(new RegExp(`:${prop}`, 'g'), value)
      this.route = path + document.location.search + document.location.hash
    }
  }

  _querySetter (prop, prevValue) {
    return value => {
      const search = document.location.search
        .replace(new RegExp(`${prop}=${prevValue}`, 'g'), `${prop}=${value}`)
      this.route =
        document.location.pathname + search + document.location.hash
    }
  }
}