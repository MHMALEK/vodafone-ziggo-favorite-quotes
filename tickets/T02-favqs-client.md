# T02 — FavQs client

**Story:** As the API, I talk to FavQs through one typed module so upstream weirdness never leaks into route handlers.

**Depends on:** T01

## Scope
- `src/favqs/client.ts`: `getQotd(): Promise<Quote>`, `searchQuotes(q: string): Promise<Quote[]>`.
- Sends `Authorization: Token token="KEY"` on every call; 5s timeout via AbortController.
- zod-parses upstream responses into internal `Quote` (`{id, body, author, tags}`); extras dropped.
- Typed `UpstreamError` with `kind: "http" | "timeout" | "network" | "malformed"` (later mapped to 502/504 by middleware).
- Handle the FavQs empty-search quirk (placeholder `id: 0` "No quotes found" row → `[]`). **Verify the real shape with one manual curl before coding the mapping.**
- The API key is read only where the auth header is built and never appears in log output or error messages.

## Acceptance criteria
- [x] Unit tests (mocked `fetch`): qotd happy path, search happy path, empty search → `[]`, upstream 500 → `UpstreamError(http)`, timeout → `UpstreamError(timeout)`, malformed JSON/shape → `UpstreamError(malformed)`.
- [x] No route/Express imports in the module.
- [x] One manual smoke against the real FavQs API with the real key. (2026-09-02: qotd + authenticated search + empty-search quirk all verified live; no auth material in logs.)

## Verify
```bash
cd server && npm test
```
Plus manual: temporary script or curl comparing real qotd/search payloads to the zod schema.

**Done when:** criteria checked, committed `feat(T02): favqs client with typed errors`.
