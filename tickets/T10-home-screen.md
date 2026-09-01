# T10 — Home screen

**Story:** As the app user, I see the quote of the day and can like it or fetch another.

**Depends on:** T09

## Scope
- Fetch `GET /api/quote` on mount; loading spinner; error state with Retry (covers "server unreachable").
- Quote card: body, author.
- **Like** → `POST /api/favorites`; button reflects saved state (e.g. "Liked ✓", disabled or toggling); double-tap is safe (API is idempotent).
- **New Quote** button refetches.

## Acceptance criteria
- [ ] Happy path: quote renders, Like saves (visible afterward on Favorites tab).
- [ ] Server stopped → readable error + Retry works after restart.
- [ ] Like failure (server down mid-action) shows feedback, doesn't fake success.

## Verify
iOS simulator walk of the three criteria against the running server.

**Done when:** criteria checked, committed `feat(T10): home screen`.
