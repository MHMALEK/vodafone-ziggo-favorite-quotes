# Favorites Quotes — VodafoneZiggo Fullstack Assessment

Express REST API wrapping the [FavQs API](https://favqs.com/api) + a thin Expo React Native client.

> Work in progress — built spec-first. See [docs/SPEC.md](docs/SPEC.md) (requirements + API contract), [docs/DECISIONS.md](docs/DECISIONS.md) (architecture decisions), and [tickets/BACKLOG.md](tickets/BACKLOG.md) (plan + status). Full setup instructions land with ticket T14.

## Why no database

Favorites live in an in-memory `Map` (`server/src/favorites/favorites.store.ts`) — a deliberate choice, not an omission:

- The assessment explicitly allows in-memory storage, is scoped as single-user, and is evaluated on API design and error handling — a database adds setup friction for the reviewer without exercising any of that.
- **Trade-off:** favorites are lost on restart, and one process = one dataset (no horizontal scaling).
- **Exit path:** storage is behind the `FavoritesStore` interface; a SQLite/Postgres implementation is a drop-in replacement in `index.ts`, with no controller/service changes. That's the first thing I'd add for production use.
