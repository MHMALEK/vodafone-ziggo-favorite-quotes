# T17 — OpenAPI docs

**Story:** As a reviewer, I can explore the API contract interactively instead of reading code.

**Depends on:** T08

## Scope
- Hand-maintained OpenAPI 3 spec in `server/src/http/openapi.ts` covering all endpoints, schemas (Quote, Favorite, Error with correlationId), idempotent-POST semantics, and error statuses.
- `GET /openapi.json` (raw spec) + `GET /docs` (Swagger UI via swagger-ui-express).

## Acceptance criteria
- [x] `/openapi.json` returns the spec; `/docs` serves Swagger UI (both supertest-covered).
- [x] Spec matches docs/SPEC.md contract (statuses, shapes, 201/200 idempotency).
- [x] Manual: try-it-out works against a running server.

## Verify
```bash
cd server && npm test
curl -s localhost:4000/openapi.json | head
open http://localhost:4000/docs
```

**Done when:** criteria checked, committed `feat(T17): openapi spec and swagger ui`.
