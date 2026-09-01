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
