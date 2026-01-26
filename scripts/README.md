# Local scripts

This folder contains **local-only** helper scripts for auditing Firestore event data and seeding the Firestore emulator.

## Prereqs

- Node.js installed
- `scripts/` dependencies installed (`npm install` from this folder)
- Access to production via `../functions/local_admin_key.json`

## Audit event shape

Emulator:

```powershell
cd .\scripts
npm run -s audit:events:emulator
```

Production (read-only):

```powershell
cd .\scripts
npm run -s audit:events:prod
```

Summaries:

```powershell
cd .\scripts
npm run -s audit:events:emulator:summary
npm run -s audit:events:prod:summary
```

## Seed emulator from production (mapped events)

This exports several top-level collections from prod to `./seed-exports/`, **maps only the `events` collection** into the updated schema, then imports everything into the Firestore emulator.

```powershell
cd .\scripts
npm run -s seed:emulator
```

Optional: limit the number of docs per collection for a quick smoke test:

```powershell
cd .\scripts
npm run -s seed:emulator -- --limit 5
```

### Notes

- The seeder forces `FIRESTORE_EMULATOR_HOST=127.0.0.1:8080` for the import step.
- If you have an emulator already running, make sure it’s the one on `127.0.0.1:8080`.
- Internal scripts are prefixed with `_` in `package.json` and aren’t meant to be run directly.
