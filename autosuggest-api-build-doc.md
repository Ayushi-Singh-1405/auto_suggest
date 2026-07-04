# Autosuggest Backend API — Build Documentation

## 1. Project Goal

Build an Express.js backend that serves autosuggest results from a static
10,000-phrase dataset, using **4 selectable search algorithms**, plus a tiny
frontend to demo it (search box + dropdown + algorithm picker).

## 2. Confirmed Data Shape


```json
{
  "count": 10000,
  "generatedAt": "2026-07-03T11:48:40.456Z",
  "phrases": [
    { "text": "documentation engineer debugs union-find DSU", "weight": 2 },
    { "text": "Python developer deploys prompt engineering patterns", "weight": 79 }
  ]
}
```

Important real characteristics of the data (confirmed by inspecting all 10,000 entries):

- **Weights** range from **1 to 100** (integers).
- **~33% of phrases start with an uppercase letter** (e.g. "Python developer...",
  "XML integration specialist..."). This means prefix matching **must be
  case-insensitive** — `prefix=hel` should match both "help-desk..." and any
  phrase starting "Hel...".
- **248 duplicate phrase texts exist** (same text, possibly different weight).
  Any data structure keyed by phrase text (like a trie's end-of-word marker)
  must store a **list of weights/entries**, not a single value, at that node.
- The top-level object is `{ count, generatedAt, phrases }` — remember to read
  `data.phrases`, not the file root, when loading.

## 3. Required Endpoint

```
GET /api/autosuggest?prefix=hel&algorithm=brute-force&limit=10&weighted=false
```

### Query Parameters

| Param | Type | Required | Notes |
|---|---|---|---|
| `prefix` | string | yes | Case-insensitive. Empty/missing prefix → return `400` error. |
| `algorithm` | string | no, default `brute-force` | One of: `brute-force`, `binary-search`, `trie`, `gemini` |
| `limit` | integer | no, default `10` | Max number of results returned. Clamp to a sane max (e.g. 50) to prevent abuse. |
| `weighted` | boolean | no, default `false` | If `true`, sort matches by `weight` descending before applying `limit`. If `false`, return in whatever order the algorithm naturally finds them (still capped at `limit`). |

### Response Format (must match exactly)

```json
{
  "prefix": "hel",
  "algorithm": "trie",
  "weighted": false,
  "limit": 10,
  "count": 10,
  "results": [
    { "text": "help-desk engineer optimizes SQL injection prevention", "weight": 53 }
  ],
  "elapsedMs": 0.55
}
```

- `count` = number of items actually in `results` (not total matches in the dataset).
- `elapsedMs` = time taken by the search itself (not the whole HTTP round trip),
  measured with `process.hrtime.bigint()` or `performance.now()`.

### Error Cases to Handle

- Missing `prefix` → `400 { "error": "prefix query parameter is required" }`
- Invalid `algorithm` value → `400 { "error": "algorithm must be one of: brute-force, binary-search, trie, gemini" }`
- `limit` not a positive integer → `400` or silently fallback to default (your call, document whichever you pick)
- Gemini algorithm called but no API key configured → `500 { "error": "Gemini API key not configured" }`

## 4. The Four Algorithms

All four must return the **same shape** of matches (array of `{text, weight}`)
so the response formatting code doesn't need to know which algorithm ran.

### 4.1 Brute-force
- On each request: loop through all 10,000 phrases in memory, keep any where
  `text.toLowerCase().startsWith(prefix.toLowerCase())`.
- Simplest, O(n) per request. No pre-processing needed at startup.

### 4.2 Binary Search
- **At server startup**: create a sorted copy of the phrases array, sorted by
  `text.toLowerCase()`.
- **Per request**: binary-search the sorted array for the first index where
  `text.toLowerCase() >= prefix.toLowerCase()`, then walk forward collecting
  entries while they still start with the prefix (standard "find range" binary
  search — two binary searches, or one + linear scan of the matching block).
- O(log n) to find the start, then O(k) to collect k matches.

### 4.3 Trie
- **At server startup**: build a trie (prefix tree) over all phrase texts,
  lowercased for indexing. Each trie node needs a way to reach all phrases
  in its subtree — either:
  - store an array of `{text, weight}` entries at each end-of-word node
    (remember: duplicates mean a node can have >1 entry), **and**
  - either store full phrase-references at every node bubbling up, or do a
    DFS collection from the prefix's node when a query comes in.
- A common approach: at the node reached by walking the prefix, DFS through
  all descendant end-of-word nodes and collect their stored entries.
- O(prefix length) to find the node, then O(k) to collect k matches.

### 4.4 Gemini
- Calls Google's Gemini API to *generate* plausible autosuggestions instead
  of searching the local dataset.
- Needs a `GEMINI_API_KEY` in environment variables (`.env` file, never
  committed to git).
- Suggested prompt to send Gemini: ask it to complete the given prefix into
  `limit` short, realistic autocomplete phrases similar in style/topic to
  the existing dataset (you can pass a few sample phrases from `phrases.json`
  as style reference), returned as strict JSON array of strings.
- Since Gemini won't naturally return a `weight`, assign a placeholder weight
  (e.g. `weight: 0` or `weight: null`) and note this in a comment, OR ask
  Gemini to also invent a 1–100 weight per suggestion — document whichever
  you choose in the code comments.
- Wrap the Gemini call in try/catch; on failure return a `502` with a clear
  error message rather than crashing the server.

## 5. Suggested Project Structure

```
autosuggest-backend/
  package.json
  .env.example
  .gitignore
  data/
    phrases.json
  src/
    server.js              # express app + route wiring
    loadPhrases.js          # reads phrases.json into memory once at startup
    algorithms/
      bruteForce.js
      binarySearch.js
      trie.js
      gemini.js
    routes/
      autosuggest.js        # GET /api/autosuggest handler, param validation
  public/
    index.html               # simple search box + dropdown + algorithm selector
    app.js
    style.css
  test/
    manual-test.sh          # curl commands for all 4 algorithms
```

## 6. Deployment Note

The mentor's example URL is `https://autosuggest-backend.onrender.com/...`,
implying deployment on **Render.com** (free tier works fine for this). Render
needs: a `package.json` with a `start` script (`node src/server.js`), the
port read from `process.env.PORT` (Render assigns this dynamically, don't
hardcode 3000), and `GEMINI_API_KEY` set as an environment variable in the
Render dashboard rather than committed in `.env`.

---

## 7. Things to Double-Check Once It's Built

- [ ] Prefix matching is case-insensitive for all three local algorithms
- [ ] `results` never exceeds `limit`
- [ ] `weighted=true` actually returns highest-weight matches first
- [ ] brute-force, binary-search, and trie return the **same set of matches**
      for the same prefix (order may differ if `weighted=false`, but the set
      should match — good sanity check that binary-search/trie are correct)
- [ ] `elapsedMs` is realistic (trie should generally beat brute-force on
      short prefixes, binary-search in between)
- [ ] Empty results (`prefix` matching nothing) returns `count: 0,
      results: []`, not an error
- [ ] Server doesn't crash if Gemini API key is missing/invalid — degrades
      to a clean error response
