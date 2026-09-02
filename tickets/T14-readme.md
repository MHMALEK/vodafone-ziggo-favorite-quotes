# T14 — README + submission

**Story:** As a reviewer, I can run everything from the README alone and read the reasoning the assessment asks for.

**Depends on:** all

## Scope
Root `README.md`:
- What this is (one paragraph) + repo layout.
- Server: prereqs (Node ≥ 20, Docker optional), FavQs key signup link, `.env` setup (**where the key goes**), all three run modes (npm standalone, raw docker commands, make targets) + test commands.
- Mobile: run instructions (`npx expo start`), `EXPO_PUBLIC_API_URL`, Android emulator `10.0.2.2` note.
- Endpoint table (from docs/SPEC.md).
- The four required answers: what I implemented / why implemented-or-skipped / trade-offs (source: docs/DECISIONS.md) / what I'd improve with more time (persistence, shared types package, qotd caching for rate limits, CI, retry policy…).
- Final full-suite run: server lint+build+test, mobile test, one end-to-end manual walk.

## Acceptance criteria
- [x] A fresh-clone dry run following only the README works for both parts. (2026-09-02: clean clone → server install/lint/61 tests/build/boot + mobile install/typecheck/19 tests, all green.)
- [x] All four assessment questions answered.
- [ ] Reminder: repo link must be shared ≥ 24h before the interview (owner action).

## Verify
Fresh terminal, follow README top to bottom.

**Done when:** criteria checked, committed `docs(T14): README`, submission checklist reviewed.
