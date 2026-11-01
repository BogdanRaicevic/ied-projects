# Tech debt & cleanup plan

Found in an audit on 2026-10-30. Fix in small PRs, roughly in this order.
Tick items off (or delete them) as they're fixed.

## P0 — security / reliability

- [x] **Backup command injection & secret leak** — `ied-be/src/database/backupToS3.ts`
  builds `mongodump --uri=${MONGO_URI}` as a shell string for `exec` and logs
  the full command (with credentials) on failure. Use `spawn` with an args
  array; never log the URI.
- [x] **Server can't boot without AWS creds** — `backupToS3.ts` throws at
  import time if bucket/keys are missing, and `server.ts` imports it via
  `database/cron.ts` even when `BACKUP_TO_S3=false`.
- [ ] **Unvalidated request bodies** — firma/zaposleni create & update pass
  `req.body` into Mongoose (`firma.routes.ts`, `firma.service.ts`); also
  `/pretrage/save|delete`, `/racuni/search`. (`/firma/search` and
  `/export-*` are done.)
- [x] **Unauthenticated `/api/test`** — `routes/test.routes.ts`, mounted
  before `requireApiAuth`. Delete it.
- [x] **Env not validated at startup** — `utils/envVariables.ts`; e.g. empty
  `MONGO_URI` goes straight to `mongoose.connect`. Parse env with Zod.

## P1 — correctness

- [ ] **Error → status mapping** — `errorWrapper.ts` sends every
  `ErrorWithCause` as 400; services throw plain `Error` for not-found →
  500. Introduce `NotFoundError`/`ValidationError` (or `status` on
  `ErrorWithCause`) and map them.
- [x] **`validateRequestQuery` discards the parsed query** — removed;
  handlers call `Schema.parse(req.query)` and use the result. `GET /racuni`
  (v1) still reads raw `req.query`.
- [ ] **Audit middleware** must run before validation because it reads the
  id from the raw body/params with a fallback chain (`middleware/audit.ts`),
  so it does a DB read even for requests that then fail validation. Fix: one
  id source per route.
- [x] **Firma search table never refreshes after mutations** — FE invalidates
  `["firme-pretrage"]` but the table isn't a query (`FirmasTable.tsx`,
  `useFirmaMutations.ts`).
- [x] **No `pageSize` cap** on firma search streaming (`firma.routes.ts`).
- [x] **BE tests flaky locally** — MongoMemoryServer can exceed the default
  10s launch timeout. Raise `instance.launchTimeout` in `tests/setup.ts`.

## P2 — consistency / maintainability

- [ ] FE components fetching in `useEffect` instead of TanStack Query:
  `Racun/PretrageRacuna`, `pages/Racuni.tsx`, `SeminariTableActionCell`,
  `PrijaveSeminarTable`, `SaveDataButton`, `RacunV2Content`.
- [x] Query keys: inline strings in mixed styles; `firmaQueryKey` defined twice.
  Add a key factory per domain.
- [x] `api/*.ts` try/catch/console.error boilerplate: one response
  interceptor in `api/interceptors/auth.ts` logs failures; callers get the
  original AxiosError. No 401 handling: Clerk refreshes tokens and its
  components already handle signed-out users.
- [x] Business logic in routes: `firma.routes.ts` search cursor moved into
  the service. Left on purpose: the Clerk lookup (who is calling is HTTP
  context; the service gets `userEmail`), CSV parsing (request decoding),
  and the `racuni_v2` POC checks (rewritten with the v2 plan).
- [ ] Inconsistent REST verbs/paths and status codes (201 on update,
  POST for delete).
- [ ] Mixed file naming (`racuni_v2.routes.ts` vs `firmaQueryBuilder.ts`,
  `seminari.routes` vs `seminar.service`). Pick one when moving files.
- [x] Puppeteer/PDF code lives in `docx.service.ts` / `docx.utils.ts` —
  split into `pdf.service.ts`.
- [ ] Racun v1 Zustand store with untyped `updateNestedField(path, any)`.
- [ ] Large components (>350 lines): `RacunV2/SummaryPanel`, `FirmaForm`,
  `PretragaParameters`, `Racun/PretrageRacuna`, `UslugaStavkaCard`,
  `SeminarForm`, `pages/Racuni`.
- [ ] `any` hot spots: `seminari.api.ts`, `Autocomplete/Multiple.tsx`,
  `useEmailSuppression.tsx`, `ErrorWithCause.details`.

## P3 — cleanup

- [x] Unused deps: `styled-components`, `@mui/styled-engine-sc` (ied-fe).
- [x] MySQL leftovers in `mongo-migrator` (config, `mysql2`, 2024 import migrations).
- [x] `db.ts` `once("open")` listener never fires.
- [x] Stale `homepage` in `ied-fe/package.json`.
- [ ] Root `README.md` is empty.
- [x] Typos: `ZaposleniFrom.tsx`, `trasnformedPrijava`.
- [ ] Puppeteer `--no-sandbox`.

## Blocked on Racuni V2 phase 2

Racun v1 (BE route/service/model, FE `Racun/`, docx templates) stays until v2
persists invoices and has search. See `plans/racuni-v2-plan.md`.
