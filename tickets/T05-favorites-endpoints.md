# T05 — POST + GET /api/favorites

**Story:** As the app user, I can like a quote and see everything I liked.

**Depends on:** T03, T04 (error middleware)

## Scope
- `POST /api/favorites`: zod body `{id: positive int, body: non-empty string, author: string, tags?: string[]}` → 201 `{favorite}` created / 200 `{favorite}` when already saved; 400 with field details on invalid body.
- `GET /api/favorites` → 200 `{favorites}` newest-first.

## Acceptance criteria
- [x] Supertest: 201 first like, 200 duplicate like (same favorite back), 400 on missing/invalid fields (id 0, empty body, wrong types), GET returns saved list in order, GET empty → `{favorites: []}`.

## Verify
```bash
cd server && npm test
curl -s -X POST localhost:4000/api/favorites -H 'content-type: application/json' -d '{"id":1,"body":"x","author":"y"}'
curl -s localhost:4000/api/favorites
```

**Done when:** criteria checked, committed `feat(T05): save and list favorites`.
