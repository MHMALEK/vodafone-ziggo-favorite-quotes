# T16 — CI pipeline (GitHub Actions)

**Story:** As a reviewer, I see quality gates run on every push — not just a claim that tests pass locally.

**Depends on:** T13 (mobile tests exist), T15 (image builds)

## Scope
- `.github/workflows/ci.yml`, on push + PR to main, Node 22, npm cache:
  - job **server**: `npm ci`, lint, build, test
  - job **mobile**: `npm ci`, test
  - job **docker**: `docker build server/` (image build check only, no push)

## Acceptance criteria
- [x] Workflow green on the latest commit on GitHub (`gh run list`).
- [x] A deliberately broken test on a scratch branch turns the run red (then delete the branch). (Scratch PR run concluded `failure` as expected; PR closed, branch deleted.)

## Verify
```bash
gh run list --limit 3
gh run watch
```

**Done when:** criteria checked, committed `ci(T16): quality gates for server, mobile, image`.
