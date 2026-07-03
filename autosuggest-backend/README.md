# Autosuggest Backend

Express server with four autocomplete algorithms (brute-force, binary-search, trie, Gemini) over 10,000 software/tech job-role phrases.

## Setup

```bash
npm install
cp .env.example .env
```

Edit `.env` and set your `GEMINI_API_KEY` (optional — only needed for the Gemini algorithm).

## Run locally

```bash
npm start
```

Server starts on `http://localhost:3000`. Open it in a browser for the frontend or call the API directly.

## API

**`GET /api/autosuggest`**

| Param      | Type    | Default | Description |
|------------|---------|---------|-------------|
| `prefix`   | string  | —       | **Required.** Prefix to complete. |
| `algorithm`| string  | —       | **Required.** One of: `brute-force`, `binary-search`, `trie`, `gemini`. |
| `limit`    | number  | `10`    | Max results (1–50). |
| `weighted` | boolean | `false` | Sort by weight descending when `true`. |

**Response shape:**

```json
{
  "prefix": "hel",
  "algorithm": "trie",
  "weighted": true,
  "limit": 5,
  "count": 5,
  "results": [
    { "text": "help-desk engineer designs distributed tracing with Jaeger", "weight": 99 },
    { "text": "help-desk engineer integrates union-find DSU", "weight": 98 }
  ],
  "elapsedMs": 2.15
}
```

**Example curl:**

```bash
curl "http://localhost:3000/api/autosuggest?prefix=hel&algorithm=trie&limit=5&weighted=true"
```

## Deploy on Render.com

1. Push the repo to GitHub.
2. In the Render dashboard, create a **New Web Service** and connect the repo.
3. Use these settings:

   | Setting        | Value                    |
   |----------------|--------------------------|
   | Build Command  | `npm install`            |
   | Start Command  | `npm start`              |
   | Health Check Path | `/`                   |

4. Add environment variables in the Render dashboard:

   - `PORT` — automatically set by Render (leave blank to use the default)
   - `GEMINI_API_KEY` — your Gemini API key (optional)

5. Deploy. The service will be available at `https://<your-app>.onrender.com`.
