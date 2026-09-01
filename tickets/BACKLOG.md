# Backlog

Order = dependency order. One ticket at a time; a ticket is **done** only when its acceptance criteria are checked, its tests are green, it's verified per its Verify section, and it's committed (`feat(T##): …` / `test(T##): …` / `docs(T##): …`).

Workflow rules:

- No pushing without explicit confirmation; commits stay local until then.
- Never skip/hide a failing test to get green.
- Scope changes go through docs/SPEC.md first, then the ticket.

| # | Ticket | Est | Status |
|---|--------|-----|--------|
| T01 | [Server scaffold](T01-server-scaffold.md) | 30m | ☐ |
| T02 | [FavQs client](T02-favqs-client.md) | 45m | ☐ |
| T03 | [Favorites store](T03-favorites-store.md) | 20m | ☐ |
| T04 | [GET /api/quote](T04-get-quote.md) | 25m | ☐ |
| T05 | [POST + GET favorites](T05-favorites-endpoints.md) | 30m | ☐ |
| T06 | [DELETE favorite](T06-delete-favorite.md) | 15m | ☐ |
| T07 | [Search endpoint](T07-search-endpoint.md) | 20m | ☐ |
| T08 | [API hardening + full test pass](T08-api-hardening.md) | 30m | ☐ |
| T09 | [Expo scaffold + navigation + API client](T09-mobile-scaffold.md) | 35m | ☐ |
| T10 | [Home screen](T10-home-screen.md) | 30m | ☐ |
| T11 | [Favorites screen](T11-favorites-screen.md) | 30m | ☐ |
| T12 | [Search screen](T12-search-screen.md) | 30m | ☐ |
| T13 | [Dark mode + RN component tests](T13-polish.md) | 45m | ☐ |
| T14 | [README + submission](T14-readme.md) | 30m | ☐ |

Total ≈ 7h (required core T01–T05, T09–T11 ≈ 4.5h; rest is the optional scope).
