# IED Monorepo — Agent Instructions

Internal CRM for an education company (and its sister brands): companies
(firme) and their employees, seminar registrations, invoices and attendance
certificates. Domain language is **Serbian** — read
[docs/domain-glossary.md](docs/domain-glossary.md) before touching business
logic.

## Workspaces

| Path | What | Stack |
|---|---|---|
| `ied-be/` | REST API | Express 5, Mongoose 9, Clerk, Sentry, Zod, Puppeteer, Handlebars |
| `ied-fe/` | SPA | React, Vite, MUI, Clerk, TanStack Query, react-hook-form, Zustand |
| `ied-shared/` | Zod schemas, constants, invoice calculators | Zod (consumed as **TS source**, no build step) |
| `mongo-migrator/` | One-way MongoDB data migrations | Mongoose, tsx |

pnpm workspaces + Turborepo, Node version in `.nvmrc`.

## Commands

Run from the repo root unless noted.

```sh
pnpm install
pnpm dev                       # BE (:8000) + FE (vite) in watch mode
pnpm typecheck                 # all workspaces
pnpm lint:error                # Biome, errors only — this is what CI runs
pnpm test:run                  # vitest (ied-be needs mongodb-memory-server)
pnpm -F ied-be test:run -- tests/services/firma.service.test.ts   # one file
pnpm -F <workspace> biome:check   # format + lint + organize imports (writes)
pnpm knip                      # unused files/exports/deps
pnpm -F mongo-migrator dev     # run pending migrations against MONGO_URI
```

**Before you say a change is done:** `pnpm typecheck && pnpm lint:error` and
the tests of the workspace you touched must pass. If you changed `ied-shared`,
that means FE and BE too — they import its source directly. If a check fails
for a reason unrelated to your change, say so; don't silence it. CI runs
build, lint and test on every PR to `main`.

## Where things go

- **Shared shape of an entity** (request body, form values) → Zod schema in
  `ied-shared/src/types/<entity>.zod.ts`, exported from `ied-shared/src/index.ts`.
  BE validates with it, FE forms resolve with it. Never redefine it locally.
- **BE endpoint** → `routes/<x>.routes.ts` (HTTP only: validate, call service,
  respond) → `services/<x>.service.ts` (business logic + DB) →
  `models/<x>.model.ts`. Complex filters go in `queryBuilders/`.
- **FE server data** → `api/<x>.api.ts` (axios call) → `hooks/<x>/use<X>Queries.ts`
  / `use<X>Mutations.ts` (TanStack Query) → component. Components must not
  call `api/*` directly (some old ones do — see tech debt).
- **DB data change** → new file `mongo-migrator/src/migrations/YYYYMMDDHHmm_snake_name.ts`
  exporting `up(db)`. There is no `down` and no transaction: a migration that
  fails halfway is re-run from the start next time, so make it safe to re-run.
  Never edit a migration that has already run in production — add a new one.

Details: [docs/backend.md](docs/backend.md), [docs/frontend.md](docs/frontend.md),
[docs/testing.md](docs/testing.md), [docs/architecture.md](docs/architecture.md).

## How to work in this repo

- **Do only what the task asks.** If you spot another problem (including
  items in `docs/tech-debt.md`), mention it at the end — don't fix it in the
  same change.
- **Ask before deciding direction.** New dependency, new pattern or folder,
  changed API shape, changed data model, deleting a feature: stop, propose
  it with a recommendation, and wait. Don't pick silently.
- **Follow the code around you** unless this file or `docs/tech-debt.md` says
  that pattern is a known mistake.
- Changing an API response or a shared Zod schema means updating both BE and
  FE in the same change.

## Rules

- Keep domain names in Serbian, matching existing code (`firma`, `zaposleni`,
  `prijava`, `racun`). Don't translate identifiers to English.
- User-supplied strings used in `$regex` must go through `escapeRegex`
  (`ied-be/src/utils/utils.ts`). There are tests for this; keep it that way.
- Validate every request body/query with a Zod schema via
  `validateRequestBody` / `validateRequestQuery`. Don't pass `req.body`
  straight into Mongoose. Caveat: `validateRequestQuery` only checks — it
  does not replace `req.query` with the parsed (coerced) value, so query
  values are still strings in the handler.
- Errors: `ErrorWithCause` always becomes a **400** and a plain `Error`
  becomes a **500** (`middleware/errorWrapper.ts`). For "not found", return
  `res.status(404)` from the route as existing routes do.
- Every `/api/*` route is behind `requireApiAuth` (Clerk). Don't mount routes
  before it in `server.ts`.
- Biome is the only formatter/linter. Run `biome:check` instead of formatting
  by hand.
- Commits follow Conventional Commits (`feat:`, `fix:`, `chore:` …) —
  semantic-release derives versions and `CHANGELOG.md` from them. Never edit
  `CHANGELOG.md` or the root `version` by hand.
- Never read or print `.env` files; use `.example.env` to learn variable names.
- Invoices exist in two versions: **v1** (`/racuni`, docx templates, persisted)
  is live; **v2** (`/racuni-v2`, behind `VITE_FF_RACUNI_V2`, Handlebars →
  Puppeteer PDF, not persisted yet) is in progress. Plan:
  [docs/plans/racuni-v2-plan.md](docs/plans/racuni-v2-plan.md). New invoice
  work goes into v2 unless asked otherwise.

## Known problems

The codebase was built fast. [docs/tech-debt.md](docs/tech-debt.md) lists
known issues and the intended direction. Don't copy a pattern listed there
into new code, and don't fix items from it unless the task asks.

<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": false` in the root `turbo.json` or `turbo.jsonc` to opt out; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->
