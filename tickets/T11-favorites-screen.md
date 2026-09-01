# T11 — Favorites screen

**Story:** As the app user, I see everything I liked and can unlike.

**Depends on:** T09 (T10 useful for seeding data)

## Scope
- `GET /api/favorites` on focus (`useFocusEffect`) so likes made on Home/Search appear without app restart.
- FlatList of favorites (body, author, savedAt); friendly empty state ("No favorites yet — like something on Home").
- Unlike → `DELETE /api/favorites/:id`, row disappears (refetch or local remove); loading + error states.

## Acceptance criteria
- [ ] Like on Home → switch tab → it's listed. Unlike → it's gone; server list agrees (`curl /api/favorites`).
- [ ] Empty state renders when the store is empty.
- [ ] Server stopped → readable error, no crash.

## Verify
iOS simulator walk of the criteria against the running server.

**Done when:** criteria checked, committed `feat(T11): favorites screen`.
