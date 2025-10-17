# Find My Hospital

Find My Hospital is an MVP that helps Korean users enter symptoms, map them to likely medical departments with GPT-5, and jump straight to Naver Map searches. The project ships with:

- Supabase Edge Function (`search`) that orchestrates GPT-5 (server-side key), builds Naver search URLs, adds CORS, and logs usage.
- SQL migration to create a `queries` table for simple analytics.
- React (Vite + TypeScript) frontend designed for deployment on GitHub Pages.

## Project Structure

- `supabase/functions/search/index.ts` — Edge Function implementation.
- `supabase/migrations/20240701000000_create_queries_table.sql` — Database migration for logging.
- `frontend/` — Vite React app that calls the edge function.

## Backend (Supabase)

### Prerequisites

- Supabase project with CLI authenticated (`supabase login`).
- Environment variables configured in Supabase dashboard (Function settings):
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `OPENAI_API_KEY`
  - Optional: `ALLOWED_ORIGIN` (defaults to `*`).

> ⚠️ The Edge Function uses the server-side `OPENAI_API_KEY`. Never expose this key in client bundles.

### Local Development

```bash
cd supabase
supabase functions serve search --env-file ./functions/.env.development
```

Create a file like `supabase/functions/.env.development` that contains the same environment variables listed above (they are `.gitignore`d by default).

### Database Migration

```bash
cd supabase
supabase db push
```

### Deploy Edge Function

Deploy with JWT verification disabled so the public frontend can call it directly:

```bash
cd supabase
supabase functions deploy search --no-verify-jwt
```

After deployment the Invoke URL will look like:

```
https://<project-ref>.functions.supabase.co/search
```

Use this value for `VITE_EDGE_URL` in the frontend `.env` file.

## Frontend (Vite + React)

### Setup

```bash
cd frontend
npm install
```

Create a `.env` file and set `VITE_EDGE_URL` to the deployed Supabase function URL (`https://<project-ref>.functions.supabase.co/search`).

### Local Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Deploy to GitHub Pages

#### Option 1: Manual (recommended for CI/CD)

1. Enable GitHub Pages for the repository (Settings → Pages) and select the `gh-pages` branch.
2. Add a GitHub Actions workflow (for example, using Vite’s template) that runs `npm ci`, `npm run build`, and publishes `frontend/dist`.

#### Option 2: From Local Machine

```bash
npm run deploy
```

This script uses `gh-pages` to publish the `dist` folder to the `gh-pages` branch.

## API Contract (Edge Function)

- **Endpoint**: `POST /search`
- **Headers**:
  - `Content-Type: application/json`
- **Body**:

```json
{ "symptom": "어제부터 심한 복통과 설사가 있어요." }
```

- **Response** (`200 OK`):

```json
{
  "departments": ["내과", "감염내과"],
  "searches": [
    {
      "department": "내과",
      "webUrl": "https://map.naver.com/v5/search/%EB%82%B4%EA%B3%BC",
      "appUrl": "nmap://search?query=%EB%82%B4%EA%B3%BC"
    }
  ]
}
```

Errors return JSON with an `error` field and an appropriate HTTP status code.

## Next Steps

- Add rate limiting/auth middleware if you need to protect the Edge Function.
- Expand logging/analytics with user identifiers (if available) in `queries`.
- Prefetch Naver results or integrate additional data sources for richer suggestions.
