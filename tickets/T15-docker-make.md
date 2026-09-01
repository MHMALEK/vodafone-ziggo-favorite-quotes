# T15 — Dockerize server + Makefile

**Story:** As a reviewer, I can run the API with plain npm, with two docker commands, or with one make target — whichever I trust most.

**Depends on:** T08 (graceful shutdown, /health)

## Scope
- `server/Dockerfile`: multi-stage — deps/build stage (`npm ci`, `tsc`) → runtime stage (`node:22-alpine`, prod deps + `dist/` only, `USER node`), `HEALTHCHECK` hitting `/health`.
- `server/.dockerignore` (node_modules, dist, .env, coverage).
- Root `Makefile`, self-documenting `make help`:
  - `setup` (npm install server + mobile), `dev`, `test`, `lint`, `build`
  - `docker-build`, `docker-run` (`--env-file server/.env`, port 4000, named container), `docker-stop`, `docker-logs`
  - `mobile` (expo start)
- Raw docker commands documented for the README (build, run with env-file, stop).

## Acceptance criteria
- [ ] `make docker-build && make docker-run` → `/health` and `/api/quote` answer from the container; `docker ps` shows status *healthy*.
- [ ] Container runs as non-root (`docker exec … whoami` → `node`).
- [ ] `make docker-stop` (SIGTERM) stops it in <5s with the shutdown log line — no 10s kill timeout.
- [ ] `.env` is not in the image (`docker run … cat .env` fails); image only contains dist + prod deps.
- [ ] Every make target works from a clean checkout.

## Verify
```bash
make help && make docker-build && make docker-run
curl -s localhost:4000/health && curl -s localhost:4000/api/quote
docker ps --format '{{.Names}} {{.Status}}'
time make docker-stop
```

**Done when:** criteria checked, committed `feat(T15): dockerfile and makefile run modes`.
