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

## PR 1: error handler and Sentry (backend only, highest value)

### 1a. Validation 400s are reported to Sentry as 500s

`server.ts` registers `Sentry.setupExpressErrorHandler(app)` **before**
`errorWrapper`. Sentry captures any error without a `status` field as a 500
(`defaultShouldHandleError` in `@sentry/core`). A `ZodError` has no
`status`, so every `Schema.parse(req.query)` failure creates a Sentry issue,
even though the client correctly gets a 400.

**Approach:** split `errorWrapper` into two handlers and put Sentry between them:

```ts
// server.ts
app.use(zodErrorHandler);            // ZodError → 400, never reaches Sentry
Sentry.setupExpressErrorHandler(app);
app.use(errorWrapper);               // everything else
```

Don't use Sentry's `shouldHandleError` for this: setting it replaces the
default `status >= 500` filter, and then body-parser 400s/413s would start
going to Sentry too.

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
Write a unit test, `tests/middleware/errorWrapper.test.ts`, with a stub `res`
and three cases:
- a `ZodError` gives 400 with `errors`;
- `Error("x")` gives 500 with `{ message: "Internal server error" }`;
- `{ status: 413 }` gives 413.

Manual check: send a bad query to an `audit-log` route. You should get a 400
and no new Sentry issue.

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

## PR 4 (optional): remove the `try { … } catch (e) { next(e) }` boilerplate

Express 5 already sends a rejected promise from an async handler to the
error handler. About 50 of these blocks in `routes/` do nothing.

**Approach:** do it in one mechanical PR after PR 1, so that PR 1's diff
stays readable. This **changes a documented pattern**, so the same PR must
also update:
- `AGENTS.md` ("Validate every request body …": drop "inside the handler's `try`");
- `docs/backend.md` (the route example around line 31).

Whether to do it: there is no change in behaviour. The benefit is less noise,
and new code stops copying the pattern. Skip it if the churn isn't worth it
to you.

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
