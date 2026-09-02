# Deployment

Demo: https://morning-summit-455.fly.dev — Fly.io app `morning-summit-455`, region `ams`, config `server/fly.toml`. One machine, auto-stops on idle (cold start after a pause). Favorites are in-memory and reset on restart.

- Deploy: push to `main`. CI gates (lint, tests, coverage, API E2E, docker build) must pass, then the `deploy` job runs `flyctl deploy --remote-only`.
- Manual: `cd server && fly deploy`
- Logs: `fly logs -a morning-summit-455` · Status: `fly status -a morning-summit-455`

## Secrets

| Secret | Store | Rotate |
|---|---|---|
| `FLY_API_TOKEN` (deploy-time, app-scoped) | GitHub Actions | `fly tokens create deploy -a morning-summit-455 \| gh secret set FLY_API_TOKEN` |
| `FAVQS_API_KEY` (runtime) | Fly secrets | `fly secrets set FAVQS_API_KEY=<key> -a morning-summit-455` |

CI holds pipeline credentials; the runtime platform holds app secrets. The key never enters git, the image, or CI logs, and rotation needs no rebuild.

## Alternatives

- Render — equivalent container hosting; Fly chosen for the CLI-only flow.
- Vercel — no: serverless is stateless (kills the in-memory store), and `/metrics` + SIGTERM drain don't apply.
- Kubernetes — the production path (sketch in README); overkill for a demo.
