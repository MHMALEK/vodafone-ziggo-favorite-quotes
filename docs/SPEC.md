# Spec — Favorites Quotes (VodafoneZiggo fullstack assessment)

A small Express REST API that wraps the FavQs API and manages liked quotes, plus a thin Expo React Native app that consumes it. The backend is the graded part. Required scope targets 4–6h; everything beyond is polish.

Source of truth: `Assessment — Fullstack Developer.pdf`. This spec resolves its open points.

## Requirements

Required:

- The Express API is the **only** component that talks to FavQs; the RN app talks only to our API.
- The FavQs API key lives server-side only (env var), never shipped to the client.
- Endpoints: quote of the day, save favorite, list favorites (see contract below).
- RN app with React Navigation: **Home** (show quote, Like button) and **Favorites** (list saved) screens, basic loading/error states.
- Unit tests for at least one non-trivial backend module.
- README: how to run both parts, where the key goes, and answers to: what did you implement / why implement or skip things / trade-offs / what you'd improve with more time.

Optional — all included in this plan:

- `GET /api/quotes/search?q=` proxying FavQs search + a Search screen.
- `DELETE /api/favorites/:id` + unlike in the app.
- "New Quote" refetch button on Home.
- Supertest integration tests.
- Light/dark mode + 1–2 RN component tests.

Out of scope (per assessment): authentication, user management (single implicit user), database.

## API contract

All responses JSON. Errors use `{ "error": { "code": string, "message": string } }`.

| Method & path | Success | Errors |
|---|---|---|
| `GET /health` | 200 `{status:"ok"}` | — |
| `GET /api/quote` | 200 `{quote}` | 502 upstream failed, 504 upstream timeout |
| `GET /api/quotes/search?q={keyword}` | 200 `{quotes:[…]}` (empty array when no hits) | 400 missing/blank `q`, 502, 504 |
| `POST /api/favorites` | 201 `{favorite}` created, 200 `{favorite}` already saved (idempotent) | 400 invalid body |
| `GET /api/favorites` | 200 `{favorites:[…]}` newest-saved first | — |
| `DELETE /api/favorites/:id` | 204 | 400 non-numeric id, 404 unknown id |

Shapes:

- `quote`: `{ id: number, body: string, author: string, tags: string[] }` — mapped from FavQs, upstream extras dropped.
- `POST /api/favorites` body: `{ id: positive int, body: non-empty string, author: string, tags?: string[] }` (client sends the quote it already has; the server does not re-fetch it).
- `favorite`: `quote` + `savedAt: ISO string`.
- Unknown routes → 404 JSON error; unexpected exceptions → 500 JSON error (no stack traces in responses).

## Storage semantics

In-memory store (explicitly allowed by the assessment), keyed by FavQs quote id, behind a `FavoritesStore` interface so a persistent implementation can be swapped in. Data is lost on restart — documented trade-off in the README.

## FavQs upstream (reference)

- Base `https://favqs.com/api`, auth header `Authorization: Token token="KEY"` sent on all calls.
- `GET /qotd` → `{ qotd_date, quote: {…} }`.
- `GET /quotes?filter={keyword}` → `{ page, last_page, quotes: […] }`. Known quirk: an empty result may come back as a single placeholder quote (`id: 0`, "No quotes found") — verify during implementation and map to an empty array.
- Rate limit is modest (~30 req / 20 s); fine for this exercise, caching listed as a future improvement only.

## Non-goals

No database, no auth, no deployment setup, no CI pipeline (nice-to-have if time is left over, not planned).
