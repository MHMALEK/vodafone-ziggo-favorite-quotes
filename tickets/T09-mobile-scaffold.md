# T09 — Expo scaffold + navigation + API client

**Story:** As the app user, I open the app and switch between Home, Favorites, and Search tabs.

**Depends on:** T08 (stable API contract)

## Scope
- `mobile/`: `create-expo-app` (TypeScript), React Navigation bottom tabs: Home, Favorites, Search (placeholder screens).
- `src/api/client.ts`: typed wrapper over fetch for all five endpoints; base URL from `EXPO_PUBLIC_API_URL` (default `http://localhost:4000`); normalizes API + network errors into one `ApiError` the screens can render.
- Shared `Quote`/`Favorite` types mirroring the server DTOs.
- `.env.example` documenting `EXPO_PUBLIC_API_URL` (+ Android `10.0.2.2` note).

## Acceptance criteria
- [ ] `cd mobile && npm i && npx expo start` → app renders in iOS simulator, all three tabs navigable.
- [ ] API client compiles with no `any` in its public surface.

## Verify
iOS simulator smoke: launch, tap through the three tabs.

**Done when:** criteria checked, committed `feat(T09): expo scaffold, navigation, api client`.
