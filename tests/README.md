# Tests

End-to-end behaviour tests: Gherkin features (`e2e/features/*.feature`) run by Playwright via [playwright-bdd](https://github.com/vitalets/playwright-bdd). Step definitions are in `e2e/steps/`, per-scenario state and cleanup in `e2e/fixtures.ts`, and browser actions in `e2e/support/actions.ts`. `npm run test:e2e` generates the specs (`bddgen`) and then runs them. Granular tests live with the code they cover: Cloud Function API tests and Firestore rules tests are in [functions/test](../functions/test) (vitest) and reuse the helpers in `tests/helpers`.

## Setup (once)

```powershell
cd tests
npm install
npx playwright install chromium
```

## Run

1. Start the stack and wait for seeding to finish ("Seeded ... users"):

   ```powershell
   cd webapp
   npm run dev
   ```

   This starts the webapp (http://localhost:3000), Firebase emulators, the seed script, and the mock GitHub (port 4600).

2. In another terminal, from `tests/`:

   | Command | Runs |
   | --- | --- |
   | `npm run test:e2e` | Playwright browser tests |
   | `npm run test:e2e:ui` | Same, in Playwright's UI mode |

   From `functions/` (run `npm install` there once; it also needs `tests/` installed for the shared helpers):

   | Command | Runs |
   | --- | --- |
   | `npm test` | Rules and API tests |
   | `npm run test:rules` | Firestore rules |
   | `npm run test:api` | Cloud Function APIs (signup intake, whiteboard) |

If the stack isn't running, the tests stop immediately and say which service is missing.

## Notes

- Tests run serially (one worker) and clean up the events and DJs they create, so they can be re-run without resetting the stack.
- Browser tests sign in with a custom token through an emulator-only hook (`window.__signInWithCustomToken`), not Discord.
- Whiteboard pushes go to the mock GitHub; the tests reset it and inspect it via `GET /__state` and `POST /__reset`.
- On e2e failure, screenshots and traces are written to `test-results/` (`npx playwright show-trace <trace.zip>`).
