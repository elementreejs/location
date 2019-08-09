# @elementree/location
Data-only, observable location for Elementree. Location templates are not
bound to pages or views to provide flexibility.

## Installation

```sh
$ npm install --save @elementree/location
```

## Example

```js
import { merge, prepare, render } from 'elementree'
import locationFrom from '@elementree/location'

const AppState = {
  // The library expects a 'routes' property on the state
  // object passed to the exported function
  routes: [
    // variables that are part of `document.location.pathname`
    // are added to the `path` property
    //
    // key/value pairs that are part of the `document.location.query`
    // are added to the 'query' property
    '/items/:id'
  ]
}

function exampleView (appState) {
  const location = locationFrom(appState)
  return render`
    <body>
      <p>Current route: ${appState.route}</p>
      <p>Item ID: ${location.path.id}</p>
      <button onclick=${incrementID}>Increment ID</button>
    </body>
  `

  function incrementID () {
    location.path.id = parseInt(location.path.id) + 1
  }
}

merge(document.body, prepare(exampleView), AppState)
```
