# T12 — Search screen

**Story:** As the app user, I search quotes by keyword and like results directly.

**Depends on:** T09

## Scope
- Search box, search on submit (no debounce complexity); scrollable FlatList of results.
- Like button per row → `POST /api/favorites` with per-row feedback (liked state).
- States: initial hint, loading, empty result ("Nothing found for X"), error with retry.

## Acceptance criteria
- [ ] Real keyword returns results; like from a row shows up on the Favorites tab.
- [ ] Gibberish keyword shows the empty state (not an error).
- [ ] Server stopped → readable error, no crash.

## Verify
iOS simulator walk of the criteria against the running server.

**Done when:** criteria checked, committed `feat(T12): search screen`.
