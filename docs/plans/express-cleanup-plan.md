# Express cleanup plan (ied-be)

Review date: 2026-11-17. Scope: `ied-be/src/server.ts`, `middleware/`, `routes/`.

**Verdict:** the `(req, res)` usage itself is fine. The real problems are how
errors are handled, plus a few wrong status codes. Do the work as small PRs,
in this order. Each PR is independent and safe to stop after.

Completed items are removed from this file, so everything listed here is
still to do.

Rule for every PR: keep it to the smallest diff that fixes the item. Don't
"clean up while you're there". Run `pnpm typecheck && pnpm lint:error` and
`pnpm -F ied-be test:run` before calling it done.

---

## PR 1: JSON error responses (backend only)

### 1b. 500s are answered with Express's HTML page

For a plain `Error`, `errorWrapper` calls `next(err)`, which falls through to
Express's built-in handler. That handler sends an HTML page, and the page
includes the stack trace unless `NODE_ENV=production`.

**Approach:** answer with JSON in `errorWrapper`. Keep two Express rules:
respect `err.status`, and hand off if headers were already sent.

```ts
export function errorWrapper(err: unknown, _req: Request, res: Response, next: NextFunction) {
  if (res.headersSent) return next(err);
  // body-parser sets status (400 malformed JSON, 413 too large) — keep it.
  const status = (err as { status?: number }).status ?? 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ message: status >= 500 ? "Internal server error" : String((err as Error).message) });
}
```

Watch out: a version that always sends 500 would turn malformed-JSON and
payload-too-large requests into 500s.

### Test

There are no HTTP tests and no `supertest`. Don't add a dependency for this.
Add cases with a stub `res` to `ied-be/tests/utils/errorWrapper.test.ts`:
- `Error("x")` gives 500 with `{ message: "Internal server error" }`;
- `{ status: 413 }` gives 413;
- with `headersSent: true` it calls `next(err)` and sends nothing.

---

## PR 2: wrong status codes (changes the API, so update BE and FE together)

| Where | Now | Should be |
|---|---|---|
| `firma.routes.ts` `PUT /:firmaId/zaposleni/:zaposleniId` | 201 | 200 (it's an update) |
| `seminari.routes.ts` `POST /update-prijava/:id` | 201 | 200 |
| `firma.routes.ts` `DELETE /:id` | 200 with `firma \|\| []` | 404 when the service returns `null` |
| `seminari.routes.ts` `GET /:id` | 200 with `null` | 404 when not found |
| `email_suppression.routes.ts` lines 107, 128 | 202 Accepted | 200 (the work finishes synchronously) |
| `velicina_firme.routes.ts` `GET /` | 404 branch on a list | delete the branch (`find()` never returns `null`) |

**Approach:** change the status codes only, nothing else. On the FE, axios
throws on a 404, so check the callers:
- `deleteFirma` (`ied-fe/src/api/firma.api.ts:89`) returns `status`; check
  what its callers do with it.
- `GET /api/seminari/:id` (`ied-fe/src/api/seminari.api.ts:69`): check what
  its query does on an error.

---

## PR 3: validation that bypasses the house pattern

| Where | Now | Fix |
|---|---|---|
| `racuni.routes.ts` `GET /` (lines ~120–155) | manual `typeof` checks + `Request<{}, any, any, RacunQueryType>` cast | `const q = Schema.parse(req.query)` inside the handler (AGENTS.md rule) |
| `tip_seminara.routes.ts` `POST /create`, `PUT /update/:id` | manual `safeParse` returning a 400 without the issues | `validateRequestBody(TipSeminaraSchema)` |
| `racuni_v2.routes.ts` `POST /generate` | manual `safeParseAsync` | `validateRequestBody(RacunV2Zod)`; keep the two POC 400 checks after it |

**Approach:** swap one pattern for the other in each route. Responses stay
the same, except that `tip_seminara` 400s now include `errors` (the FE
doesn't read the body).

---

## Skipped on purpose (not worth the change)

- **One shape for all error bodies** (`text` vs `{ message }` vs `{ error }`).
  The FE only reads `error.response.status` (`seminari.api.ts:89`, 409), never
  the body. Revisit only when the FE starts showing server messages.
- **Moving the audit middleware after validation.** On an invalid request it
  costs one `findById`. The Clerk email lookup is already cached
  (`utils.ts` `clerkEmailCache`).
- **The `res.send` wrapping in `middleware/audit.ts`.** This is the usual way
  to capture a response body, and it works because `res.json` calls
  `res.send`. Keep it.
- **`req.body as X` casts** after `validateRequestBody`. These are type
  annotations only, and `req.body` is `any` in Express's types.
- **`res.attachment(fileName)` instead of two `setHeader` calls.** Nice to
  have, but the file names are already sanitised (`sanitizeFilename`).
- **RPC-style paths** (`POST /seminari/update/:id`, `DELETE /seminari/delete/:id`).
  These would change the API shape for no user-facing gain.
- **`res.json(result || [])` on list routes.** Harmless.

## Not checked

- I read these routes in full: `firma`, `seminari`, `docx`, `racuni_v2`,
  `tip_seminara`, `velicina_firme`, and part of `racuni`. The rest I only
  searched for these patterns.
- What `NODE_ENV` the production servers run with. This decides whether 1b
  currently leaks stack traces.

---

## Last: only after everything above is resolved

### `validateRequestBody` answers unexpected errors with its own 500

`ied-be/src/middleware/validateSchema.ts` wraps `schema.safeParseAsync` in a
`try`/`catch` that logs the error and sends
`500 { message: "Internal server error during validation process" }`. It's
the same kind of bug as the old inline 500s in the routes: the error never
reaches Sentry's error handler, so it never becomes an issue.

`safeParseAsync` doesn't throw on invalid input; it returns
`{ success: false }`. The `catch` only fires when an async refine or
transform inside a schema throws, which is a real bug, and that should
reach Sentry.

**Approach:** delete the `try`/`catch` and keep the `safeParseAsync` +
400 branch as it is. Express 5 sends the rejection to the error middleware.
Add a test in `ied-be/tests/` with a schema whose `refine` throws, and check
that the middleware's promise rejects with that error and no response is
sent. Express turns that rejection into `next(err)`.
