# T06 — DELETE /api/favorites/:id

**Story:** As the app user, I can unlike a quote.

**Depends on:** T05

## Scope
- `DELETE /api/favorites/:id` → 204; 404 unknown id; 400 non-numeric id.

## Acceptance criteria
- [x] Supertest: 204 removes (subsequent GET no longer lists it), 404 for unknown, 400 for `abc`.

## Verify
```bash
cd server && npm test
```

**Done when:** criteria checked, committed `feat(T06): delete favorite`.
