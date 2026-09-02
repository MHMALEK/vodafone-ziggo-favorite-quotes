# Secret handling

The only secret is `FAVQS_API_KEY`.

## Local (what this repo does)

- [x] Key lives in `server/.env` (gitignored); `server/.env.example` is the template.
- [x] Read once at boot (`src/config.ts`), fail-fast with a readable error when missing.
- [x] Used in exactly one place: the Authorization header builder in `src/quotes/favqs.client.ts`.
- [x] Never logged, never in error responses (test-asserted), never sent to the mobile app.
- [x] Docker: injected at runtime via `--env-file server/.env` — the image contains no `.env` (verified) and no baked-in key.

A local secret manager is deliberately **not** used: for a single-dev exercise it adds setup friction without changing the security property that matters here (key stays out of Git, logs, images, and the client). `.env` is the standard local boundary.

## Production (how this would ship)

- Store the key in the platform's secret manager (Kubernetes: Vault or External Secrets Operator syncing from GCP/AWS Secret Manager).
- Inject at runtime as an env var or mounted file — never in the image, never in Git, never in Helm values.
- The app already fits this: config is read from the environment at boot and a missing key crashes the pod at startup instead of serving 500s.
- Rotation: update the secret, rolling-restart; no code change. Scope the key per environment (separate FavQs accounts for acc/prd).
