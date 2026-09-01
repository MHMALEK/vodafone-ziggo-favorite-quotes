# T07 — GET /api/quotes/search

**Story:** As the app user, I can search quotes by keyword.

**Depends on:** T02, T04 (error middleware)

## Scope
- `GET /api/quotes/search?q={keyword}` → 200 `{quotes}`; 400 when `q` missing or blank; upstream errors via existing middleware.
- Empty FavQs result (placeholder-row quirk) → `{quotes: []}`.

## Acceptance criteria
- [ ] Supertest: 200 with results, 200 `{quotes:[]}` on no hits, 400 missing `q`, 400 blank `q`, 502 upstream failure.
- [ ] Manual curl with a real keyword returns plausible quotes.

## Verify
```bash
cd server && npm test
curl -s 'localhost:4000/api/quotes/search?q=coffee'
```

**Done when:** criteria checked, committed `feat(T07): quote search endpoint`.
