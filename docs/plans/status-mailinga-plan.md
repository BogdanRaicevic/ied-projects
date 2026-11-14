# `prijavljeni: boolean` → `status_mailinga` (4 states) — plan

Status: **plan approved, all questions answered, not started.** Written to be picked up
in a fresh session. Read [AGENTS.md](../../AGENTS.md) first. The
suppression bug fix this builds on is already on `main`.

## Why

`prijavljeni` (true/false) on firma and zaposleni can't say *why* someone
doesn't get mail. Since `email_suppressions` exists we know four things
about an email, and the UI, search and export should show and use all four:

| Value (stored) | UI label (sr) | Meaning | User can toggle? |
|---|---|---|---|
| `SUBSCRIBED` | Prijavljeni | Gets our mail | → `UNSUBSCRIBED` |
| `UNSUBSCRIBED` | Odjavljeni | Asked not to / unsubscribed | → `SUBSCRIBED` |
| `HARD_BOUNCE` | Neispravan email | Address doesn't exist | **no — permanent** |
| `SPAM_COMPLAINT` | Spamovali su nas | Marked us as spam | **no — permanent** |

## Decisions (from the owner)

1. **Status is stored on each contact** as `status_mailinga`, written
   **only** by the suppression service (one write path). Search filters on
   the field directly. Rejected: deriving it from `email_suppressions` on
   every read (search would have to `$nin` the whole list,
   case-insensitively).
2. **Rules are per email**: every firma and zaposleni with the same email
   (case-insensitive) has the same status.
3. **Email change → status follows the new email**: look it up in
   `email_suppressions`; not there → `SUBSCRIBED`.
4. **No email → `SUBSCRIBED` stored**, switch disabled with "nema email".
5. **Search filter**: checkboxes with the four statuses, separately for
   firma and zaposleni (as today). Default: only `SUBSCRIBED` checked.
   None checked or all checked = no filter.
6. **Export follows the filter exactly** — whatever statuses are selected
   are exported, **including `HARD_BOUNCE` / `SPAM_COMPLAINT`**: that's
   intended, it's used to clean up the DB by hand. The special "drop
   suppressed on export" (`withoutSuppressed`) goes away; the default
   filter `SUBSCRIBED` keeps the default export campaign-safe.
7. **Field name** `status_mailinga`. **Stored values stay English**
   (`SUBSCRIBED`, `UNSUBSCRIBED`, `HARD_BOUNCE`, `SPAM_COMPLAINT`) — the
   existing `SUPPRESSION_REASONS` constants and the values in the imported
   CSVs. Serbian only as UI labels (table above).
8. Migration `202611131200_sync_prijavljeni_with_email_suppressions.ts` has
   only run locally → **delete it**, fold into the new migration.
9. **`email_suppressions` is the only source of truth.** A contact's
   status = the reason of its email's row, else `SUBSCRIBED`.
   - **Legacy `prijavljeni: false` → `UNSUBSCRIBED`** (set from
     `komentar ~ /odjav/` by `202511012256_pull_odjave_to_property`; those
     values are correct). To keep the list the only truth, the migration
     first adds an `UNSUBSCRIBED` row for each such email (insert-only,
     never overwrites an existing reason). Without the row, any later
     recompute — a re-run of the migration, or an email change (decision
     3) — would silently flip them to `SUBSCRIBED`.
     - Side effect (decision 2, per email): other contacts sharing that
       email become `UNSUBSCRIBED` too.
     - Legacy `false` **without an email**: no row is possible → stored
       `UNSUBSCRIBED`. If an email is added later, status follows that
       email (decision 3).
   - Everything else without a row, including contacts without an email →
     `SUBSCRIBED`.

## The state machine (per email)

Lives in `ied-shared` as pure functions, used by BE (writes) and FE
(what the switch allows). Table-test it in `ied-shared` (vitest exists).

| state \ event | `UNSUBSCRIBE` (switch off) | `RESUBSCRIBE` (switch on) | import `UNSUBSCRIBED` | import `HARD_BOUNCE` | import `SPAM_COMPLAINT` |
|---|---|---|---|---|---|
| `SUBSCRIBED` | `UNSUBSCRIBED` | — | `UNSUBSCRIBED` | `HARD_BOUNCE` | `SPAM_COMPLAINT` |
| `UNSUBSCRIBED` | — | `SUBSCRIBED` | — | `HARD_BOUNCE` | `SPAM_COMPLAINT` |
| `HARD_BOUNCE` | refused | refused (409) | ignored | `HARD_BOUNCE` | `SPAM_COMPLAINT` |
| `SPAM_COMPLAINT` | refused | refused (409) | ignored | `HARD_BOUNCE` | `SPAM_COMPLAINT` |

("—" = no change. Permanent → permanent: last import wins, both blocked —
same as today's `$set`.)

Sketch:

```ts
// ied-shared/src/constants/statusMailinga.ts
export const STATUS_MAILINGA = {
  SUBSCRIBED: "SUBSCRIBED",
  ...SUPPRESSION_REASONS, // UNSUBSCRIBED, HARD_BOUNCE, SPAM_COMPLAINT
} as const;
export type StatusMailinga = keyof typeof STATUS_MAILINGA;

export const STATUS_MAILINGA_LABEL: Record<StatusMailinga, string> = {
  SUBSCRIBED: "Prijavljeni",
  UNSUBSCRIBED: "Odjavljeni",
  HARD_BOUNCE: "Neispravan email",
  SPAM_COMPLAINT: "Spamovali su nas",
};

export const isPermanent = (s: StatusMailinga) =>
  s === "HARD_BOUNCE" || s === "SPAM_COMPLAINT";

type MailingEvent =
  | { type: "UNSUBSCRIBE" }
  | { type: "RESUBSCRIBE" }
  | { type: "IMPORT"; reason: SuppressionReasons };

/** The table above. null = refused. */
export const nextStatusMailinga = (
  s: StatusMailinga,
  e: MailingEvent,
): StatusMailinga | null => { /* switch over the table */ };
```

`email_suppressions` stays as is: it's the per-email record (and the
source for contacts created later with an already-suppressed email).
Invariant: **row with reason R ⇔ every contact with that email has
`status_mailinga: R`; no row ⇔ `SUBSCRIBED`.** Only exception: legacy
contacts without an email that were `prijavljeni: false` stay
`UNSUBSCRIBED` (decision 9).

## Changes by area

### ied-shared

- New constants + `nextStatusMailinga` + labels (sketch above) + table
  test. Export from `src/index.ts`.
- `types/firma.zod.ts`: `prijavljeni` → `status_mailinga:
  z.enum(STATUS_MAILINGA)` (optional on input; BE ignores it on writes —
  see BE).
- `types/pretrage.zod.ts`: `firmaPrijavljeni` / `zaposleniPrijavljeni`
  (`PRIJAVA_STATUS` enum) → `firmaStatusMailinga` /
  `zaposleniStatusMailinga`: `z.array(z.enum(STATUS_MAILINGA))`.
- `constants/firma.ts`: delete `PRIJAVA_STATUS` / `PrijavaStatusType`.

### ied-be

- `models/firma.model.ts`, `models/zaposleni.model.ts`: replace
  `prijavljeni: { type: Boolean, default: true }` with
  `status_mailinga: { type: String, enum: [...], default: "SUBSCRIBED" }`.
- `models/pretrage.model.ts`: saved-search filter fields as above.
- `services/email_suppression.service.ts`: `setPrijavljeniForEmails` →
  `setStatusForEmails(emails, status)` (same case-insensitive collation +
  `arrayFilters`). `addSuppressedEmail` writes the row's final reason
  (after the permanent-wins rule) to contacts — **careful:** an
  `UNSUBSCRIBED` import onto an existing permanent row must write the
  *existing* reason, not `UNSUBSCRIBED`. `removeSuppressedEmail` →
  `SUBSCRIBED`. Use `nextStatusMailinga` instead of local
  `PERMANENT_REASONS` logic.
- `services/firma.service.ts`:
  - `create`, `updateFirmaById`, `createZaposleni`, `updateZaposleni`:
    drop any client-sent `status_mailinga`; when the email is new or
    changed, set status from `isEmailSuppressed(email) ?? "SUBSCRIBED"`.
    Replaces the four copy-pasted "if suppressed then `prijavljeni =
    false`" blocks with one helper.
  - Exports: delete `withoutSuppressed` and the in-loop `prijavljeni`
    checks in `exportSearchedZaposleniData`; filter by the selected
    statuses (decision 6).
  - `getSuppressedEmailsSet` (in `email_suppression.service.ts`) becomes
    unused → delete if nothing else uses it (`pnpm fallow dead-code`).
- `queryBuilders/firmaQueryBuilder.ts` (lines ~113–118, ~164–169):
  `prijavljeni = true/false` → `status_mailinga: { $in: selected }`, and
  for zaposleni the `$elemMatch` equivalent. Skip the filter when none or
  all four are selected.
- `services/pretrage.service.ts`: map the renamed saved-search fields.
- Routes: no URL changes. `remove-email` keeps its 409.

### ied-fe

- `components/MailingListSwitch/MailingListSwitch.tsx`: takes
  `status_mailinga` (+ `hasEmail`). Switch on/off = `SUBSCRIBED` /
  `UNSUBSCRIBED`; **disabled** for `HARD_BOUNCE` / `SPAM_COMPLAINT` (show
  the Serbian label) and when there's no email ("nema email").
- `hooks/firma/useEmailSuppression.tsx`: the switch still calls
  `add-email` (`UNSUBSCRIBED`) / `remove-email` immediately (unchanged
  behaviour). The status shown comes from the contact itself; keep
  `check-status` only for an email typed in the form but not saved yet.
  Replace its own if-chain with `isPermanent` from `ied-shared`.
- `components/FirmaForm/FirmaForm.tsx`, `components/Zaposleni/ZaposleniForm.tsx`,
  `pages/Firma.tsx`: `prijavljeni` → `status_mailinga`.
- `components/FirmasTable/FirmasTable.tsx:57`,
  `ZaposleniTable.tsx:89`: row colour from `status_mailinga !==
  "SUBSCRIBED"`; consider a status column with the label.
- `components/PretragaParameters/PrijaveRadioButtons.tsx` → checkbox
  group (reuse `components/CheckboxList`), wired in
  `PretragaParameters.tsx`; default in `store/pretragaParameters.store.ts`
  = `["SUBSCRIBED"]`.

### mongo-migrator

- **Delete** `202611131200_sync_prijavljeni_with_email_suppressions.ts`
  (local only, decision 8).
- New `YYYYMMDDHHmm_prijavljeni_to_status_mailinga.ts` (re-runnable,
  decision 9):
  1. Legacy unsubscribes → list: for every firma / zaposleni with
     `prijavljeni: false` and a non-empty email, upsert
     `{ email: <trimmed, lowercased>, reason: "UNSUBSCRIBED" }` with
     `$setOnInsert` (never overwrites a bounce/spam row).
  2. Every firma and zaposleni **with an email**:
     `status_mailinga: "SUBSCRIBED"`. Without an email:
     `prijavljeni: false` → `"UNSUBSCRIBED"`, else `"SUBSCRIBED"`; once
     `prijavljeni` is gone (re-run), leave their existing status alone.
  3. For each reason, the emails on the list with that reason (chunked):
     `status_mailinga: <reason>` on matching firme and zaposleni
     (case-insensitive collation + `arrayFilters`).
  4. `$unset: { prijavljeni: "" }` on firme and `zaposleni.$[]`.
  Re-run safe: step 1 is insert-only and finds nothing once `prijavljeni`
  is gone; steps 2–3 recompute the same result from the list.
- New `YYYYMMDDHHmm_pretrage_status_mailinga.ts` (saved searches in
  `pretrage`): `"subscribed"` → `["SUBSCRIBED"]`, `"unsubscribed"` →
  `["UNSUBSCRIBED", "HARD_BOUNCE", "SPAM_COMPLAINT"]` (today's meaning of
  `false`), `"all"`/missing → `[]`; unset the old fields. Pattern:
  `202601201138_migrate_prijave_values_in_pretrage.ts`.

### docs

- `docs/domain-glossary.md`: add `status_mailinga` + the four labels.
- `state-machines-plan.md`: deleted (all items done).

## Tests (red → green)

- `ied-shared`: table test for `nextStatusMailinga` (every cell above).
- `ied-be` (update / extend, all exist):
  - `email_suppression.service.test.ts`: import sets the status (not
    false); `UNSUBSCRIBED` import onto `HARD_BOUNCE` keeps contacts at
    `HARD_BOUNCE`; re-subscribe → `SUBSCRIBED`.
  - `firma.service.suppression.test.ts`: create/update with a suppressed
    email → that status; email change → status of the new email; client
    can't set `status_mailinga` directly.
  - `firma.service.search.test.ts`: filter by one / several / none /
    all statuses, firma and zaposleni.
  - `firma.service.export.test.ts`: export follows the filter.
  - Fixtures: `tests/fixtures/staticTestData.json`,
    `tests/utils/seedData.ts` (`prijavljeni` → `status_mailinga`).
- Migrations: run each twice against `mongodb-memory-server` with a
  throwaway test (as done for `202611131200`), assert same result. Cases:
  row reason → that status (mixed-case contact email); legacy
  `prijavljeni: false` + email → `UNSUBSCRIBED` **and** an `UNSUBSCRIBED`
  row exists; another contact sharing that email → `UNSUBSCRIBED`; legacy
  `false` on an email that is already `HARD_BOUNCE` → stays `HARD_BOUNCE`;
  legacy `false` without email → `UNSUBSCRIBED`; `true` without email →
  `SUBSCRIBED`; `prijavljeni` field gone; second run changes nothing;
  saved searches mapped.
- FE: no test setup (see `docs/testing.md`) → manual check:
  switch on/off, disabled for bounce/spam/no email, search checkboxes,
  export.

## Order of work / PRs

One PR — the shared schema changes force BE + FE + migration together
(AGENTS.md). Commits in this order:

1. `ied-shared`: status constants + `nextStatusMailinga` + table test.
2. BE: models, suppression service, firma service, query builder,
   pretrage; tests red → green.
3. Migrations (+ delete `202611131200`).
4. FE: switch, forms, tables, search checkboxes.
5. Docs.

Branch from `main` **after** the item-1 PR (`refactor/state-machines`)
is merged. Until this lands, nobody runs `mongo-migrator` against
production (it would run `202611131200`, which we then can't delete).

**Deploy:** run the new migrations together with the deploy. Old
documents without `status_mailinga` read as the default `SUBSCRIBED`, so
real unsubscribes would look subscribed until the migration runs.

## Out of scope / later

- **Per-list subscriptions** (which mailing lists someone is on). Not on
  `status_mailinga`: that field is the global "may we email this address
  at all" gate — bounce and spam are always global. Per-list membership
  would be its own collection keyed by email, e.g.
  `{ email, lista, status: "SUBSCRIBED" | "UNSUBSCRIBED" }`, only
  consulted when `status_mailinga` is `SUBSCRIBED`. Same split as most
  email platforms: global suppression + list subscriptions.
- Lowercasing `e_mail` on contacts (would remove the need for collation).
- Index on `status_mailinga` / `zaposleni.status_mailinga` — add if search
  gets slow.
