# T19 — Dislikes ("don't show this again")

**Story:** As the app user, I can hide a quote forever; it stops appearing in search and quote of the day.

**Depends on:** T08, T12

## Scope
- Server: `dislikes/` feature (in-memory id set behind `DislikesStore`, controller with POST/GET/DELETE). Quotes *service* enforces the rules: search results filtered, quote-of-the-day retried up to 3 FavQs attempts then 404 `NO_QUOTE_AVAILABLE`, dislike evicts a matching favorite (docs/SPEC.md, D15).
- App: thumb-down action on Home (hides + auto-fetches the next quote) and on Search rows (removes the row); errors surface in the Snackbar.
- OpenAPI spec updated.

## Acceptance criteria
- [x] Server tests: store unit tests, endpoint tests (201/200 idempotent, 400, 204/404), service filter + retry + exhausted-404, favorite eviction. 61 total green, coverage 100/96.
- [x] Mobile: hide button wired on both screens; suites green (19 tests).
- [x] Manual: hidden quote disappears from search results live.

## Verify
```bash
cd server && npm test
curl -s -X POST localhost:4000/api/dislikes -H 'content-type: application/json' -d '{"id":123}'
```

**Done when:** criteria checked, committed `feat(T19): dislikes`.
