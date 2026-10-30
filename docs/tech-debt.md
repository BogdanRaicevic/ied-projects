# Tech debt & cleanup plan

Found in an audit on 2026-10-30. Fix in small PRs, roughly in this order.
Tick items off (or delete them) as they're fixed.

## P0 — security / reliability

- [ ] **Backup command injection & secret leak** — `ied-be/src/database/backupToS3.ts`
  builds `mongodump --uri=${MONGO_URI}` as a shell string for `exec` and logs
  the full command (with credentials) on failure. Use `spawn` with an args
  array; never log the URI.
- [ ] **Server can't boot without AWS creds** — `backupToS3.ts` throws at
  import time if bucket/keys are missing, and `server.ts` imports it via
  `database/cron.ts` even when `BACKUP_TO_S3=false`.
- [ ] **Unvalidated request bodies** — firma/zaposleni create & update pass
  `req.body` into Mongoose (`firma.routes.ts`, `firma.service.ts`); also
  `/firma/search`, `/export-*`, `/pretrage/save|delete`, `/racuni/search`.
- [ ] **Unauthenticated `/api/test`** — `routes/test.routes.ts`, mounted
  before `requireApiAuth`. Delete it.
- [ ] **Env not validated at startup** — `utils/envVariables.ts`; e.g. empty
  `MONGO_URI` goes straight to `mongoose.connect`. Parse env with Zod.

## P1 — correctness

- [ ] **Error → status mapping** — `errorWrapper.ts` sends every
  `ErrorWithCause` as 400; services throw plain `Error` for not-found →
  500. Introduce `NotFoundError`/`ValidationError` (or `status` on
  `ErrorWithCause`) and map them.
- [ ] **`validateRequestQuery` discards the parsed query** —
  `middleware/validateSchema.ts`.
- [ ] **Audit middleware** must run before validation because it reads the
  id from the raw body/params with a fallback chain (`middleware/audit.ts`),
  so it does a DB read even for requests that then fail validation. Fix: one
  id source per route.
- [ ] **Firma search table never refreshes after mutations** — FE invalidates
  `["firme-pretrage"]` but the table isn't a query (`FirmasTable.tsx`,
  `useFirmaMutations.ts`).
- [ ] **No `pageSize` cap** on firma search streaming (`firma.routes.ts`).
- [ ] **BE tests flaky locally** — MongoMemoryServer can exceed the default
  10s launch timeout. Raise `instance.launchTimeout` in `tests/setup.ts`.

## P2 — consistency / maintainability

- [ ] FE components fetching in `useEffect` instead of TanStack Query:
  `FirmasTable`, `Racun/PretrageRacuna`, `PredefinedPretrage`,
  `pages/Racuni.tsx`, `PrijaviZaposlenogNaSeminar`, `SeminariTableActionCell`,
  `PrijaveSeminarTable`, `SaveDataButton`, `RacunV2Content`.
- [ ] Query keys: inline strings in mixed styles; `firmaQueryKey` defined twice.
  Add a key factory per domain.
- [ ] `api/*.ts` try/catch/console.error boilerplate; `seminari.api.ts`
  rethrows as `new Error(...)` losing the AxiosError. Add a response
  interceptor (incl. 401 handling) and drop the per-call catches.
- [ ] Business logic in routes: `firma.routes.ts` (streaming, Clerk lookup),
  `racuni_v2.routes.ts`, `email_suppression.routes.ts` (CSV parsing).
- [ ] Inconsistent REST verbs/paths and status codes (201 on update,
  POST for delete).
- [ ] Mixed file naming (`racuni_v2.routes.ts` vs `firmaQueryBuilder.ts`,
  `seminari.routes` vs `seminar.service`). Pick one when moving files.
- [ ] Puppeteer/PDF code lives in `docx.service.ts` / `docx.utils.ts` —
  split into `pdf.service.ts`.
- [ ] Racun v1 Zustand store with untyped `updateNestedField(path, any)`.
- [ ] Large components (>350 lines): `RacunV2/SummaryPanel`, `FirmaForm`,
  `PretragaParameters`, `Racun/PretrageRacuna`, `UslugaStavkaCard`,
  `SeminarForm`, `pages/Racuni`.
- [ ] `any` hot spots: `seminari.api.ts`, `Autocomplete/Multiple.tsx`,
  `useEmailSuppression.tsx`, `ErrorWithCause.details`.

## P3 — cleanup

- [ ] Unused deps: `styled-components`, `@mui/styled-engine-sc` (ied-fe).
- [ ] Unused env: `FF_RACUNI_V2` (ied-be), MySQL config in
  `mongo-migrator/src/config.ts`.
- [ ] `db.ts` `once("open")` listener never fires.
- [ ] Stale `homepage` in `ied-fe/package.json`; root `README.md` is empty.
- [ ] Typos: `ZaposleniFrom.tsx`, `trasnformedPrijava`.
- [ ] Puppeteer `--no-sandbox`.

## Blocked on Racuni V2 phase 2

Racun v1 (BE route/service/model, FE `Racun/`, docx templates) stays until v2
persists invoices and has search. See `plans/racuni-v2-plan.md`.
