# T08 — API hardening + full test pass

**Story:** As a reviewer, I see a service that fails cleanly everywhere, not just on the happy paths I tried.

**Depends on:** T04–T07

## Scope
- Sweep: every error path returns `{error:{code,message}}`, correct status, no stack traces in responses.
- Unhandled route → 404 JSON; unexpected throw → 500 JSON (and logged).
- Minimal request logging (method, path, status, duration) — tiny custom middleware, no morgan dependency unless trivial.
- JSON body-parse errors → 400, not a crash.
- Review test coverage of the two non-trivial modules (client, store) — fill obvious gaps.

## Acceptance criteria
- [ ] Supertest: 404 unknown route, 400 malformed JSON body, 500 path returns JSON (forced throw in a test-only route or mocked service).
- [ ] `npm test` fully green; `npm run lint` clean; `npm run build` succeeds.

## Verify
```bash
cd server && npm run lint && npm run build && npm test
curl -s localhost:4000/nope
curl -s -X POST localhost:4000/api/favorites -H 'content-type: application/json' -d '{bad json'
```

**Done when:** criteria checked, committed `feat(T08): API hardening`.
