# T08 — API hardening + observability

**Story:** As an operator, I can see what the service is doing (logs, metrics, correlation IDs); as a reviewer, I see it fail cleanly everywhere, not just on the happy paths I tried.

**Depends on:** T04–T07

## Scope

Observability (docs/SPEC.md → Observability):
- pino JSON request logging: method, path, status, duration ms, correlationId per request.
- Correlation ID middleware: honor `x-request-id`, else generate; included in every log line and every error response (`error.correlationId`).
- `GET /metrics` via prom-client: default process metrics + HTTP request duration histogram (route/method/status) + FavQs upstream call counter & duration.

Hardening:
- Every error path returns `{error:{code,message,correlationId}}`, correct status, no stack traces in responses.
- Unhandled route → 404 JSON; unexpected throw → 500 JSON (and logged at error level).
- JSON body-parse errors → 400, not a crash.
- Sweep: no empty catch blocks; the FavQs API key never appears in logs or error messages.
- Graceful shutdown: on SIGTERM/SIGINT stop accepting connections, close the HTTP server, exit 0 (makes `docker stop` in T15 clean).
- Review test coverage of the two non-trivial modules (client, store) — fill obvious gaps.

## Acceptance criteria
- [x] Supertest: 404 unknown route, 400 malformed JSON body, 500 path returns JSON with correlationId (forced throw via mocked service).
- [x] Supertest: response `error.correlationId` matches a sent `x-request-id`.
- [x] `/metrics` returns Prometheus text including the request histogram after traffic.
- [x] Grep confirms the API key can't be logged (only ever read in the client's header builder).
- [x] `kill -TERM <pid>` on a running server exits 0 promptly with a shutdown log line.
- [x] `npm test` fully green; `npm run lint` clean; `npm run build` succeeds.

## Verify
```bash
cd server && npm run lint && npm run build && npm test
curl -s localhost:4000/nope -H 'x-request-id: test-123'
curl -s -X POST localhost:4000/api/favorites -H 'content-type: application/json' -d '{bad json'
curl -s localhost:4000/metrics | head -30
```

**Done when:** criteria checked, committed `feat(T08): hardening and observability`.
