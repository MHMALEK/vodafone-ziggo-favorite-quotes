# T04 — GET /api/quote

**Story:** As the app user, I get the quote of the day from our API without knowing FavQs exists.

**Depends on:** T02

## Scope
- Route `GET /api/quote` → `200 {quote}` via the FavQs client.
- Central error middleware (first use here): `UpstreamError(http|network)` → 502, `timeout` → 504, `malformed` → 502; body `{error:{code,message}}`.
- Unknown routes → 404 JSON.

## Acceptance criteria
- [ ] Supertest (client mocked): 200 shape, 502 on upstream failure, 504 on timeout.
- [ ] Manual curl against real FavQs returns a real quote.

## Verify
```bash
cd server && npm test
curl -s localhost:4000/api/quote
```

**Done when:** criteria checked, committed `feat(T04): quote-of-the-day endpoint + error middleware`.
