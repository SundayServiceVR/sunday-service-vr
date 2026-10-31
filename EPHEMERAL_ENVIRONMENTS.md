# Ephemeral Environments Plan

Goal: a single local action spins up the full stack with seeded data, no external auth dependencies, a verifiable whiteboard request, and fast multi-role testing.

## What already exists
- Firebase emulators (functions, firestore, storage, auth, hosting) configured in `firebase.json`.
- `npm start` in `webapp` runs Vite and the emulators together, with `--import`/`--export-on-exit` of `firebase-emulator-data`.
- `functions/src/whiteboard/whiteboardSync.ts` short-circuits to `dry-run` under `FUNCTIONS_EMULATOR`.

## Gaps and actions

### 1. One button for the full stack
- Add a root-level script (e.g. `npm run dev`) and a VS Code `tasks.json` entry or launch config as the "button".
- The script:
  - Picks free ports, or uses `--project demo-<random>` so nothing can touch real Firebase.
  - Builds the functions, then starts the emulators and Vite with matching port env vars.
- Do not use `--import` / `--export-on-exit` in this mode, so state never persists.
- Centralise hard-coded hosts, ports and project IDs into one `VITE_*` config module. Currently hard-coded in:
  - `App.tsx` (`127.0.0.1:8080`)
  - `DiscordRedirect.tsx`, `util/whiteboard.ts`, `EventSignupRoot.tsx` (`127.0.0.1:5001/sunday-service-vr/...`)
  - `prestart` (`kill-port`)
- Webapp should also call `connectAuthEmulator` and `connectStorageEmulator` (auth is not connected today).
- Fixed ports are fine for one local environment; dynamic ports are needed for parallel environments (e.g. CI).
- A script is provided to run the project locally against production resources (e.g. `npm run dev:prod`)

### 2. Seed data on every start
- Replace checked-in binary exports with a TypeScript seed script using the Admin SDK against the emulator env vars (`FIRESTORE_EMULATOR_HOST`, `FIREBASE_AUTH_EMULATOR_HOST`).
- Seed DJs, events, clubs, signups and storage images. Dates are relative to "now", but there should be no event in the future so the workflows always start with event creation.
- Run once the emulators are ready (`start-server-and-test` or wait-on).
- Keep `scripts/seed-exports` only if a golden snapshot is wanted.

### 3. Whiteboard validation
- `githubRepo.ts` calls `https://api.github.com` directly, and the emulator guards skip the request entirely.
- Make the API root configurable (e.g. `GITHUB_API_ROOT`) and remove the `FUNCTIONS_EMULATOR` early-returns.
- In ephemeral mode, point the root at a small local mock GitHub server that:
  - Implements the Git Data endpoints `GithubRepo` uses (ref, commit, tree, blob, contents).
  - Records received requests and exposes them via a read endpoint.
- Tests assert on the recorded commit: file paths and content (`TimesGMT.txt`, `TimesAU.txt`, posters).
- Unit-level alternative: inject `fetch` into `GithubRepo`.
- Secrets: the launcher generates `functions/.secret.local` with a dummy `GITHUB_WHITEBOARD_TOKEN` (the value should include the word `dummy`).
- `DISCORD_CLIENT_SECRET` is NOT dummied and never written locally: Discord auth always uses real Discord. The emulator resolves it from Secret Manager of the real project (`sunday-service-vr`, via the developer's gcloud credentials), so the launcher runs the emulators under the real project ID rather than a `demo-*` ID. All data services remain emulated.

### 4. Auth with no external changes
- Real flow: Discord OAuth code exchange -> `discordAuth` -> role mapping (`rolesMap.ts`) -> custom token with a `discord_id` claim.
- Emulator-only login page with a "sign in as {admin, host, dj, bingo, none}" picker that yields a custom token with the claims `authenticate.ts` and `RoleGuard` expect.
- Discord login is not removed. It remains the normal login in every environment, and the picker is an additional back door shown alongside it.
- The back door is enabled in:
  - local emulator / `demo-` projects, and
  - ephemeral feature-branch environments (preview deploys against the shared Discord app / staging Firebase project), enabled by an explicit build-time flag (e.g. `VITE_ENABLE_DIRECT_LOGIN`) that CI sets only for preview builds.
- It must be impossible to enable in production:
  - The flag is checked at build time so the picker code is stripped from production bundles.
  - The token-minting function refuses to run unless the project ID is `demo-*` or on an explicit staging allowlist, and (for deployed previews) requires a CI-only secret.
  - Never deploy the minting function to the production project.
- This avoids the Discord redirect URI problem (Discord has no wildcard redirects) for previews: preview environments sign in via the back door, while the real Discord flow is verified on the stable registered URL.

### 5. Fast multi-role testing
- Seed one user per role with stable discord IDs (e.g. `admin-1`, `dj-1`).
- Test helper `loginAs(role)` mints a custom token via the Admin SDK on the Auth emulator and signs in without UI.
- Tests:
  - Playwright: one browser context per role, `storageState` per role saved once and reused; parallelisable.
  - Rules tests: `@firebase/rules-unit-testing` against `firestore.rules` with per-role auth contexts.
  - Function tests: call HTTP functions with a Bearer token minted per role.
- Existing `vitest` unit tests are unchanged.

### 6. Pipeline integration tests per environment
- Every PR / feature branch runs in GitHub Actions:
  - Emulator layer: start emulators with `demo-<random>`, seed, mock GitHub server, then run rules, function and Playwright tests using `loginAs(role)`. Hermetic and parallel per PR.
  - Deployed preview layer (optional): deploy a Firebase Hosting preview channel against the staging project, then run the same Playwright suite with `BASE_URL` set to the preview URL and `AUTH_MODE=staging`. Login uses the direct-login back door (#4), authenticated with a CI-only secret.
- One suite, switched by `BASE_URL` and `AUTH_MODE=emulator|staging`.
- The Discord round trip itself is covered by unit tests of the code exchange and role mapping, plus a manual check on the stable production URL.

## Suggested order
1. Centralise emulator/port config; connect auth and storage emulators.
2. Seed script and launcher.
3. Mock GitHub (and Discord) server; configurable API roots.
4. Emulator-only login and `loginAs` helper.
5. Playwright and rules tests.
6. GitHub Actions workflow for emulator and preview-environment tests.
