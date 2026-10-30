# Testing

Vitest everywhere. `pnpm test:run` runs all; `pnpm -F <ws> test:run <file>`
runs one file (with `--` it silently runs all of them).

| Workspace | What's tested | Setup |
|---|---|---|
| `ied-shared` | Invoice calculators, money formatting (`src/**/*.test.ts`) | none |
| `ied-be` | Services against a real in-memory Mongo (`tests/services/`) | `tests/setup.ts` starts MongoMemoryServer per file |
| `ied-fe` | nothing yet | — |
| `mongo-migrator` | nothing | — |

## ied-be notes

- Binary is cached in `~/.cache/mongodb-binaries`. First run downloads it.
- Collections are **not** cleared between tests in a file (the `afterEach` in
  `tests/setup.ts` is commented out). Create unique data per test or clean up.
- Fixtures: `tests/fixtures/staticTestData.json`
  (regenerate with `pnpm -F ied-be generate:test-data`).
- No HTTP/route tests yet. New endpoints should at least get a service test.

## What to test first when changing code

Invoice math (`ied-shared/src/calculations`), search query builders, and
anything that writes to the DB.
