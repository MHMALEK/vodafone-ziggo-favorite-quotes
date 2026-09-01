# T13 — Dark mode + RN component tests

**Story:** As a reviewer, I see UI polish and frontend testing beyond the required minimum.

**Depends on:** T10–T12

## Scope
- Light/dark mode: `useColorScheme` + one small palette token object used by all screens (no theming library).
- jest-expo + `@testing-library/react-native`; 1–2 component tests: Home renders a quote from a mocked API client; Home renders the error state on failure.

## Acceptance criteria
- [ ] Both color schemes look intentional in the simulator (toggle appearance).
- [ ] `cd mobile && npm test` green.

## Verify
```bash
cd mobile && npm test
```
Plus simulator appearance toggle.

**Done when:** criteria checked, committed `feat(T13): dark mode and component tests`.
