# Architecture

```
 Browser ── Clerk sign-in
    │
 ied-fe (React SPA, vite preview behind pm2)
    │  axios + Clerk bearer token   (src/api/interceptors/auth.ts)
    ▼
 ied-be (Express, pm2)  ── Clerk verify ── requireApiAuth
    │        │
    │        ├── Puppeteer ── PDF invoices (v2) & certificates
    │        ├── docxtemplater ── DOCX invoices (v1)
    │        └── cron 22:00 UTC ── mongodump ── S3   (BACKUP_TO_S3=true)
    ▼
 MongoDB  ◄── mongo-migrator (one-way migrations)

 ied-shared: Zod schemas + constants + invoice calculators, imported as TS
 source by FE, BE and migrator.
```

## Backend request flow

`ied-be/src/server.ts`:

1. `cors` — allowed origins are `FE_APP_URL` × each port in `FE_APP_ALLOWED_PORTS`
2. `clerkMiddleware`, `express.json({ limit: "1mb" })`
3. `requireApiAuth` — 401 without a Clerk user
4. Routers under `/api/*`
5. Per route: optional `createAuditMiddleware(Model)` → `validateRequestBody(Schema)` → handler → service
6. `Sentry.setupExpressErrorHandler`, then `errorWrapper`

Error → status mapping: see "Rules" in `AGENTS.md`.

## Frontend structure

- `main.tsx`: ClerkProvider → BrowserRouter → LocalizationProvider → `App`
- `App.tsx`: QueryClient + routes. Everything is behind Clerk sign-in.
- Routes: `/pretrage` (firma search, home), `/firma/:id`, `/seminari`,
  `/racuni` (v1), `/racuni-v2` (flag), `/audit-log`
- Server state: TanStack Query. Client state: Zustand
  (`store/pretragaParameters.store.ts`, v1 `Racun/store`).

## Documents

| Output | Engine | Code |
|---|---|---|
| Invoice v1 (.docx) | docxtemplater | `services/docx.service.ts`, `templates/*.docx` |
| Invoice v2 (PDF) | Handlebars → Puppeteer | `templates/invoices/*.hbs`, `templates/invoiceRenderer.ts` |
| Certificates (PDF/zip) | HTML string replace → Puppeteer | `templates/certificates/<brand>/` |

## Deployment

Manual GitHub Action `Deploy to VPS` (`.github/workflows/deploy.yaml`): SSH
to each server in the `VPS_TARGETS` repo variable, check out the ref, run
`scripts/deploy.sh`, pm2 restarts `BE` and `FE` (`ecosystem.config.js`).
Each server keeps its own gitignored `.env`. Releases (version + changelog)
are created by semantic-release on every push to `main`.
