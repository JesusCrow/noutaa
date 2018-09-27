# noutaa

- [Quick Start](#Quick-Start)
- [Features](#Features)
  - [Functions for HTTP methods](#Functions-for-HTTP-methods)
  - [Query String parameters](#Query-String-parameters)
  - [JSON body](#JSON-body)
  - [x-www-form-urlencoded body](#x-www-form-urlencoded-body)
  - [Error catching](#Error-catching)
- [License](#license)

## Quick Start

```bash
npm i noutaa
```

```js
import { GET, POST } from 'noutaa'

let sweets = await GET(`/cafe`, {
  accept: 'json'
})

console.log(sweets) // ['cookies', 'cake']

const res = await POST(`/new-cafe`, {
  json: sweets
})

console.log(res) // Response object
```

# Features

## Functions for HTTP methods

```js
import { GET, POST, PUT, PATCH, HEAD, DELETE } from 'noutaa'

GET(`/beer`) // just a normal Promise/Response object
```

## Query String parameters

Add or merge query string parameters without playing with strings.

```js
// GET /beer?strength=5
GET(`/beer`, {
  params: { strength: 5 }
})

// GET /beer?strength=5&price=free
GET(`/beer?strength=5`, {
  params: { price: 'free' }
})
```

## JSON body

```js
// with noutaa
const res = await POST(`/nudes`, {
  json: { url: 'http://gph.is/1oo2GZg' }
})

// without noutaa
const res = await fetch(`/nudes`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json; charset=utf-8'
  },
  body: JSON.stringify({ url: 'http://gph.is/1oo2GZg' })
})
```

## x-www-form-urlencoded body

```js
// with noutaa
const res = await POST(`/form`, {
  urlencoded: { message: 'hello' }
})

// without noutaa
const body = new URLSearchParams()
body.append('message', 'hello')

const res = await fetch(`/form`, {
  method: 'POST',
  body,
  headers: {
    'application/x-www-form-urlencoded'
  }
})
```
## Error catching

All response statuses that are not OK are thrown as HTTPError.  
`res.ok` are all status codes in 200s range.

```js
try {
  await DELETE(`/beer/999`);
} catch (error) {
  switch (error.code) {
    case '403': console.log(`You shalt not pass!`) break;
    case '404': console.log(`You missed!`) break;
    default: return;
  }
}
```

## TODO

- Hooks
- Authentication header for easy JWT
- `form-data`

## License

[MIT](./LICENSE)
