# Backend (`ied-be`)

Express 5 + Mongoose, run with `tsx` (no build). Entry: `src/server.ts`,
Sentry init in `src/instrument.ts`, env in `src/utils/envVariables.ts`
(names listed in `.example.env`).

## Layers

| Layer | Responsibility | Must not |
|---|---|---|
| `routes/` | Parse/validate request, call one service, choose status code | Query models, contain business rules |
| `services/` | Business logic, DB access | Know about `req`/`res` |
| `queryBuilders/` | Turn search params into Mongo filters/aggregations | Execute queries |
| `models/` | Mongoose schema + indexes | Contain logic |
| `middleware/` | auth, audit, validation, errors | |

## Adding an endpoint

1. Schema in `ied-shared/src/types/<entity>.zod.ts`, export from `index.ts`.
2. Service function in `services/<entity>.service.ts`. Throw
   `ErrorWithCause(message, code)` for expected failures (→ 400). For
   not-found, return `null` and let the route send 404.
3. Route in `routes/<entity>.routes.ts`:

   ```ts
   router.post(
     "/",
     validateRequestBody(EntitySchema),
     async (req, res, next) => {
       try {
         res.status(201).json(await createEntity(req.body));
       } catch (error) {
         next(error);
       }
     },
   );
   ```

   Add `createAuditMiddleware(Model)` (after validation) if changes must
   appear in the audit log.
4. Mount it in `server.ts` **after** `requireApiAuth`.
5. Add a service test in `tests/services/`.

Paths and verbs: match the router you're editing (most use `POST /create`,
`POST /update/:id`). Status codes: 201 create, 200 update, 404 not found.

## Mongo

- Validate ids with `validateMongoId` before querying.
- Escape user strings used in `$regex` with `escapeRegex`.
- Schema changes to existing data need a migration in `mongo-migrator`.

## Documents

Puppeteer runs as a lazy singleton browser (`docx.service.ts`). Templates live
in `src/templates/`. Preview HTML for invoices: `templates/invoices/preview/`.
