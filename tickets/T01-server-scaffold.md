# T01 — Server scaffold

**Story:** As a reviewer, I can clone the repo, install, and run a healthy API in under a minute.

**Depends on:** —

## Scope
- `server/` npm package: TypeScript strict, `tsx` dev runner, `tsc` build.
- Scripts: `dev`, `build`, `start`, `test`, `lint`.
- ESLint + Prettier, minimal config.
- Vitest configured (empty smoke test).
- `src/config.ts`: reads `.env` via dotenv — `PORT` (default 4000), `FAVQS_API_KEY` (fail fast at boot with a clear message if missing).
- `.env.example` with both vars; `.env` gitignored.
- Express app factory (`createApp()`) separate from the listener (needed later for supertest).
- `GET /health` → `200 {"status":"ok"}`.

## Acceptance criteria
- [ ] Fresh clone: `cd server && npm i && cp .env.example .env` (any key value) && `npm run dev` serves `/health`.
- [ ] Boot without `FAVQS_API_KEY` exits with a readable error, not a stack trace.
- [ ] `npm test` and `npm run lint` pass.

## Verify
```bash
cd server && npm i && npm run lint && npm test && npm run dev
curl -s localhost:4000/health
```

**Done when:** criteria checked, committed `feat(T01): server scaffold`.
