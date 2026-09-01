# Decisions

Short ADR log. Each entry: decision + why + trade-off. These feed the README's "why / trade-offs" answers.

**D1 — Monorepo `server/` + `mobile/`, no workspace tooling.** The assessment names `server/`; one repo is required for submission. Two independent npm packages (`cd server && npm i`, `cd mobile && npm i`) keep reviewer friction at zero. Trade-off: no shared types package; the API DTOs are duplicated in the mobile client (acceptable at this size, noted as an improvement).

**D2 — TypeScript everywhere, strict mode.** Types document the API contract and the FavQs mapping. Trade-off: a build step on the server (`tsx` in dev, `tsc` for build).

**D3 — Layered server: routes → services → (favqs client | favorites store).** Express handlers stay thin; the two "non-trivial modules" the assessment wants tested (FavQs response mapping, favorites store) are plain TS modules with no Express dependency, so they unit-test without HTTP.

**D4 — In-memory favorites behind a `FavoritesStore` interface.** Explicitly allowed by the assessment. Idempotent `add` (returns `created: boolean`) so double-Like is a friendly 200, not an error. Trade-off: data lost on restart; interface makes a SQLite/file swap trivial later.

**D5 — Native `fetch` + AbortController timeout for FavQs, no axios.** Node ≥ 20 ships fetch; one less dependency. Upstream failures map to typed errors → 502, timeouts → 504, so the app can distinguish "our API is down" from "FavQs is down".

**D6 — zod for request-body and upstream-response validation.** One small dependency buys runtime safety at both trust boundaries (client input, FavQs output). Malformed upstream payloads become a clean 502 instead of a crash.

**D7 — Vitest + supertest on the server, jest-expo + RN Testing Library on mobile.** Each is the idiomatic runner for its platform; vitest needs no ts-jest config. Trade-off: two runners in one repo.

**D8 — Expo + React Navigation bottom tabs (Home / Favorites / Search).** Fastest for a reviewer to run (`npx expo start`). Plain `useState`/`useEffect` + a small `useApi` hook instead of React Query — the app is deliberately thin; refetch-on-focus via `useFocusEffect` covers the Home→Favorites staleness case. Trade-off: no cache/retry sophistication, and that's fine here.

**D9 — Server port defaults to 4000.** 3000 collides with the local TRACT stack frontend on this machine; configurable via `PORT`.

**D10 — Mobile API base URL via `EXPO_PUBLIC_API_URL`.** Defaults to `http://localhost:4000` (iOS simulator); Android emulator needs `http://10.0.2.2:4000` — documented in the README rather than auto-detected.

**D11 — Simple monitoring: pino JSON logs + correlation IDs + prom-client `/metrics`.** Two small, industry-standard dependencies buy structured request logs, an ID that ties an error response to its log line, and Prometheus-scrapable metrics (request durations, upstream FavQs calls). Trade-off: no tracing/OTel and nothing consuming the metrics in this exercise — the point is that the service is *observable*, wiring Grafana/alerts is a stated next step.

**D12 — Server fully dockerized + root Makefile, three run modes.** Multi-stage Dockerfile (build stage → slim non-root runtime with prod deps only), container `HEALTHCHECK` on `/health`, graceful SIGTERM shutdown so `docker stop` (and a K8s drain) is clean. A root Makefile is the single entry point for reviewers (`make help`). Trade-offs: no docker-compose (one service — plain `docker run` is clearer) and the Expo app stays on the host (simulators don't containerize).

**D13 — CI quality gate via GitHub Actions.** One workflow: server lint + build + test, mobile test, and a docker-image build check on every push/PR. Pipelines-as-quality-gates rather than deploy scripts; deployment itself stays out of scope.
