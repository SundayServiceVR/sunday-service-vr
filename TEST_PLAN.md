# Test Plan: Event Lifecycle

Goal: validate the real-world flow end to end, with fast, isolated tests that can run per change.

1. Host creates an event with open signups.
2. DJs sign up.
3. Host closes signups, builds a lineup, and updates the whiteboard.

Builds on `EPHEMERAL_ENVIRONMENTS.md` (emulators, seed script, mock GitHub, `loginAs`).

## Principles
- Pick the cheapest layer that can prove a behaviour. Use the browser only for what needs a browser.
- Each test creates its own data (unique IDs) and never depends on another test's data or order.
- Discord is not exercised by the suite. Auth uses `loginAs(role)` (custom token minted with the Admin SDK on the Auth emulator).
- Everything runs against emulators. The only external call (GitHub) goes to a local mock.

## Layers (fastest first)

| Layer | Tool | What it proves | Speed |
|---|---|---|---|
| Rules | `@firebase/rules-unit-testing` + vitest | Role access to `events`, `djs`, `hosts`, `club` in `firestore.rules` | ms |
| Function/API | vitest + `fetch` to emulated HTTP functions, Bearer token per role | `eventSignupIntake`, `eventSignupGetEventAndDj`, `updateWhiteboard`, `clearWhiteboard` (auth, roles, validation, writes) | tens of ms |
| UI component | existing vitest | Pure logic (lineup building, time formatting) | ms |
| E2E | Playwright | Wiring between UI, Firestore and functions; one happy path per step | seconds |

Most step coverage lives in rules and function tests. Playwright covers a small number of journeys.

## Isolation
- One long-lived emulator set for the whole run: the stack started by `npm run dev` (emulators, seed, Vite). Tests do not start their own stack.
- Tests run serially (one worker). No parallelism: traffic is low and serial runs are simpler to debug.
- Repeatable: each run leaves no dependency on earlier runs. Per-test data: a fixture creates `events/test-<uuid>` (and any DJs it needs) through the Admin SDK, and deletes them afterwards. Tests only touch their own event IDs.
- Stable seeded users (`admin-1`, `host-1`, `dj-1`, `dj-2`, `bingo-1`, `none-1`) are read-only to tests. Tests that mutate a DJ create a fresh `test-<uuid>` DJ.
- Full reset (rare, or at the start of a run): `DELETE http://127.0.0.1:8080/emulator/v1/projects/<project>/databases/(default)/documents`, then re-run the seed. Restarting `npm run dev` also gives a fresh state because nothing persists.
- Mock GitHub is cleared at the start of each whiteboard test.

## Fast login
- `loginAs(role | discordId)` in test helpers: mint a custom token via Admin SDK, then
  - API tests: exchange it with the Auth emulator REST endpoint (`accounts:signInWithCustomToken`) for an ID token and use it as the Bearer token.
  - Playwright: do the exchange once per role in `globalSetup`, save `storageState` (Firebase auth lives in IndexedDB, so use `context.storageState({ indexedDB: true })`), and reuse it. No login UI per test.
- Real Discord login stays out of the suite (manual check).

## Scenarios

### Step 1: Host creates an event with open signups
- Rules: host/admin can create `events`; dj, bingo and none cannot.
- E2E (host context): open `/events/create`, fill name and start time, enable signups, save. Assert the event appears in the list and the document has `signupsAreOpen: true`.
- E2E (dj context): a DJ cannot reach `/events/create` (RoleGuard).

### Step 2: DJs sign up
- Function: `eventSignupIntake` as `dj-1` creates a signup (201), repeating updates it (200), and a user without the `dj` role gets 403. Unknown event gives 404. No token gives 401.
- Function: `eventSignupGetEventAndDj` returns the event and the caller's DJ.
- Function (to confirm behaviour first): signup to an event with `signupsAreOpen: false` must not succeed. Prod already blocks this in the UI; `eventSignupIntake` itself does not check it. Any mechanism is acceptable, so the E2E test asserts the DJ cannot complete a signup via the UI, and the function test records whether the API also rejects it (finding only, not a blocker).
- E2E (dj context): open `/eventSignup/<id>/wizard`, complete all steps, submit. Assert the success state and the signup in Firestore.
- Concurrent signups are out of scope (fewer than a dozen users a week).

### Step 3: Host closes signups, builds a lineup, updates the whiteboard
- Setup by API/Admin SDK (not UI): event with open signups and 2 signups.
- E2E (host context):
  1. Close signups. Assert `signupsAreOpen: false` and that a DJ can no longer sign up.
  2. Open the lineup editor (`/events/<id>/lineup`), assign signups to slots, order and duration. Assert the stored `slots`.
  3. Click "Update board". Assert the UI reports `updated`.
- Function: `updateWhiteboard` as host/admin succeeds, as dj/bingo/none gives 403, without token gives 401, missing `eventId` gives 400, unknown event gives 404.
- Mock GitHub assertion: the recorded commit contains `TimesGMT.txt` and `TimesAU.txt` with the expected slot times, plus poster files when a poster is set. Calling update twice with no changes returns `unchanged` and makes no commit.
- `clearWhiteboard` resets the files to the placeholder content.

### Cross-step journey (one test, serial)
Host creates event, two DJs sign up, host closes signups, builds the lineup and updates the board. Asserts the final mock GitHub commit. Kept to one test as the smoke test; everything else is covered by the faster tests above.

## Prerequisites (from the ephemeral environment plan)
1. Mock GitHub server and configurable `GITHUB_API_ROOT`; remove the `FUNCTIONS_EMULATOR` short-circuits in `whiteboardSync.ts` (lines 88 and 115) so the request is really made.
2. `loginAs` helper and role users (emulator-only; Discord left untouched).
3. Stable `data-testid` attributes on the event form, signup wizard, lineup editor and "Update board" button, so selectors do not depend on copy.
4. E2E runs against the Vite dev server from `npm run dev` (no separate build), so the tests exercise exactly what developers use locally.

## Layout
```
sunday-service-vr/
  tests/
    helpers/        loginAs.ts, fixtures.ts (createEvent, createDj, cleanup), mockGithub.ts
    rules/          *.test.ts
    functions/      *.test.ts
    e2e/            playwright specs, global-setup.ts, playwright.config.ts
```

## Commands (planned)
- `npm run test:rules`, `npm run test:functions`, `npm run test:e2e`: run against an already running `npm run dev`. Playwright uses `workers: 1`, `baseURL` `http://localhost:3000`, and a `globalSetup` that waits for the emulators and seed data (and fails with a clear "start `npm run dev`" message if absent).
- `npm run test:all`: runs all layers against the running stack.
- Optional later: Playwright `webServer` pointed at `npm run dev` with `reuseExistingServer: true`, so one command works both with and without a running stack.

## Suggested order
1. Helpers: `loginAs`, fixtures, test emulator launcher.
2. Function/API tests for step 2 and step 3 permissions (highest value, lowest cost).
3. Rules tests.
4. Mock GitHub and whiteboard assertions.
5. Playwright: step 1, step 2, step 3 happy paths, then the cross-step journey.
6. Wire into the GitHub Actions workflow.

## Open questions
None. Decisions: closed signups only need some blocking mechanism; no parallel or concurrency testing; all tests run against `npm run dev`.
