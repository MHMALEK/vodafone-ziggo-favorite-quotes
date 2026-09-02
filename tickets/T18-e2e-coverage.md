# T18 — Playwright E2E API tests + coverage gate

**Story:** As a reviewer, I see the API proven black-box over the network, and a coverage gate that keeps the unit/integration suite honest.

**Depends on:** T17

## Scope
- `server/e2e/api.spec.ts` (Playwright request API, no browser): health, live quote-of-the-day, full favorites lifecycle (201 → 200 duplicate → list → 204 → 404), validation + correlation-id echo, 404 route, docs + metrics. Playwright boots the server itself (`webServer`, port 4123).
- Coverage via `@vitest/coverage-v8` with thresholds (90% lines/functions/statements, 85% branches) — `npm run test:coverage`.
- Scripts: `test:e2e`, `test:coverage`; make targets `e2e`, `coverage`.

## Acceptance criteria
- [x] `npm run test:e2e` green against a self-started server (7 tests).
- [x] `npm run test:coverage` green — actuals: 100% stmts/lines/funcs, 95% branches.
- [x] Vitest no longer picks up Playwright specs (`include: src/**/*.test.ts`).

## Verify
```bash
cd server && npm run test:coverage && npm run test:e2e
```

**Done when:** criteria checked, committed `test(T18): playwright e2e and coverage gate`.
