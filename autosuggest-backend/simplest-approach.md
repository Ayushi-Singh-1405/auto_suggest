# Simplest approach — brute-force only

## File structure

```
project/
├── phrases.json
├── package.json
├── .env
├── src/
│   ├── server.js
│   └── loadPhrases.js
```

## `package.json`

```json
{
  "dependencies": {
    "express": "^4.21.2",
    "cors": "^2.8.5",
    "dotenv": "^16.4.7"
  },
  "scripts": {
    "start": "node src/server.js"
  }
}
```

## `src/loadPhrases.js`

- Read `phrases.json` with `fs.readFileSync`
- `JSON.parse` it
- Validate `data.phrases` exists and is an array where every item has `text` (string) and `weight` (number)
- Export the array

## `src/server.js`

- `require('dotenv').config()`, `express`, `cors`, `loadPhrases`
- Call `loadPhrases()` once at startup → `phrases` array in memory
- Create express app, use `cors()`
- Define `GET /api/autosuggest`:
  - Read query params: `prefix`, `limit` (default 10), `weighted` (default false)
  - Validate `prefix` exists, else 400
  - Filter the in-memory array: `phrases.filter(p => p.text.toLowerCase().startsWith(prefix.toLowerCase()))`
  - If `weighted === true`, sort by weight descending
  - Slice to `limit`
  - Return JSON `{ prefix, algorithm: "brute-force", weighted, limit, count, results, elapsedMs }`
- Listen on `process.env.PORT || 3000`
