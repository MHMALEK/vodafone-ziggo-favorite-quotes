# T03 — Favorites store

**Story:** As the API, I keep liked quotes in a swappable store so persistence choice stays a one-file decision.

**Depends on:** T01

## Scope
- `src/favorites/store.ts`: `FavoritesStore` interface — `add(quote): {favorite, created}`, `list(): Favorite[]`, `remove(id): boolean`.
- `InMemoryFavoritesStore`: `Map<number, Favorite>`, stamps `savedAt`, `list()` newest-saved first.
- `add` is idempotent: second add of the same id returns existing favorite with `created: false` (original `savedAt` kept).

## Acceptance criteria
- [x] Unit tests: add → created true; duplicate add → created false, savedAt unchanged; remove existing → true; remove missing → false; list ordering newest-first.
- [x] No Express imports.

## Verify
```bash
cd server && npm test
```

**Done when:** criteria checked, committed `feat(T03): in-memory favorites store`.
