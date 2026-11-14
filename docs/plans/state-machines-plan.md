# Implicit state machines — primer and fix plan

Status: **item 1 implemented** (BE + migration, tests green); items 2–5
planned. Each item below becomes its own PR,
done red → green → refactor: first prove the bug, then the smallest fix,
then cleanup.

Decided so far:

- **Own state machines, no library** (XState etc.) — see
  [When a library earns its place](#when-a-library-xstate-etc-earns-its-place).
- **No FE test setup for now.** BE bugs get automated tests; FE bugs are
  proven by a written + browser reproduction. See
  [Testing approach](#testing-approach).
- **Email suppression**: one BE behaviour change, no API shape change, plus
  a migration. See [item 1](#1-mailing-list-subscription--data-drift-be).

---

## Part 1 — How state machines work (no library)

### What one is

Anything that "is in one situation at a time" and moves between situations
when something happens. Five words cover it:

| Word | Meaning | Example (certificate dialog) |
|---|---|---|
| **State** | The situation you're in. Exactly one at a time. | `closed`, `open`, `submitting`, `failed` |
| **Event** | Something that happened. | `OPEN`, `SUBMIT`, `SUCCESS`, `FAILURE`, `CLOSE` |
| **Transition** | Rule: in state S, on event E, go to state T. | `open` + `SUBMIT` → `submitting` |
| **Context** | Data that belongs to a state. | the selected `prijava`, the error message |
| **Effect** | Work done because of a transition (API call, toast). | `submitting` → call `generateSertifikatPdfBatch` |

An event that has no transition from the current state is **ignored**. That
one rule kills a whole class of bugs: `CLOSE` while `submitting` simply does
nothing — no `if (isSubmitting) return` sprinkled in handlers.

### What "implicit" means

Nobody wrote the machine down. It exists anyway, smeared across several
`useState`s / fields, and every handler re-implements part of the rules.

Smells:

- Several booleans/nullable values that are always set **together**
  (`setOpen(true); setError(null); setSelected(x)`).
- A "reset" block that calls five setters.
- Guards like `if (isSubmitting) return` or `if (a && !b)`.
- A status field written from more than one place.
- Two stored values where one could be computed from the other.

### Why it breaks

`n` booleans give `2^n` combinations. The certificate dialog has
`isOpen`, `selectedPrijava`, `isSubmitting`, `submitError` → 16
combinations, of which **4** are meaningful. The other 12 are "impossible
states" — and the code only stays out of them as long as every handler
remembers every rule. Bugs live in the 12.

### The method (do it on paper first)

**1. List the states.** Name them as the user would. If you can't name a
combination, it's probably an impossible state.

**2. Draw the transition table.** Rows = states, columns = events, cells =
next state (empty = ignored). Empty cells you didn't expect are the
interesting ones; that's where you find bugs.

| state \ event | OPEN(p) | SUBMIT | SUCCESS | FAILURE(e) | CLOSE |
|---|---|---|---|---|---|
| closed | open(p) | | | | |
| open(p) | | submitting(p) | | | closed |
| submitting(p) | | | closed | failed(p, e) | *(ignored)* |
| failed(p, e) | | submitting(p) | | | closed |

**3. Make impossible states unrepresentable** with a TypeScript
discriminated union. Context lives *inside* the state that owns it, so
"error while closed" can't even be typed:

```ts
type CertState =
  | { status: "closed" }
  | { status: "open"; prijava: PrijavaZodType }
  | { status: "submitting"; prijava: PrijavaZodType }
  | { status: "failed"; prijava: PrijavaZodType; error: string };
```

**4. Put every transition in one pure function** (a reducer). No React, no
API calls — just `(state, event) => nextState`:

```ts
type CertEvent =
  | { type: "OPEN"; prijava: PrijavaZodType }
  | { type: "SUBMIT" }
  | { type: "SUCCESS" }
  | { type: "FAILURE"; error: string }
  | { type: "CLOSE" };

function certReducer(s: CertState, e: CertEvent): CertState {
  switch (s.status) {
    case "closed":
      return e.type === "OPEN" ? { status: "open", prijava: e.prijava } : s;
    case "open":
    case "failed":
      if (e.type === "SUBMIT") return { status: "submitting", prijava: s.prijava };
      if (e.type === "CLOSE") return { status: "closed" };
      return s;
    case "submitting":
      if (e.type === "SUCCESS") return { status: "closed" };
      if (e.type === "FAILURE") return { status: "failed", prijava: s.prijava, error: e.error };
      return s; // CLOSE ignored while submitting
  }
}
```

In React: `const [state, send] = useReducer(certReducer, { status: "closed" })`.

**5. Keep effects at the edges.** The reducer decides *what state we're in*;
the handler does the async work and reports back with events. The effect
must only run when the reducer would **accept** the event — otherwise a
double click sends `SUBMIT` twice, the reducer correctly ignores the second
one, and the handler still fires a second request:

```ts
const canSubmit = state.status === "open" || state.status === "failed";

const submit = async () => {
  if (!canSubmit) return; // same rule as the reducer: SUBMIT ignored elsewhere
  send({ type: "SUBMIT" });
  try {
    await generateSertifikatPdfBatch([...]);
    send({ type: "SUCCESS" });
  } catch (err) {
    send({ type: "FAILURE", error: String(err) });
  }
};

<Button disabled={!canSubmit} onClick={submit}>Generiši</Button>
```

React re-renders between two discrete clicks, so the second click already
sees `submitting`. The disabled button is the visible half of the same rule.

**6. Derive, don't store.** If value B can be computed from value A, don't
keep both — they *will* drift. `isOpen` is `state.status !== "closed"`.
When you *must* store both (e.g. for fast queries), give them **one write
path** that updates them together — that's item 1.

**7. Use the machine you already have.** TanStack Query's `useQuery` and
`useMutation` *are* state machines (`pending` / `error` / `success`,
`isPending`, `reset()`), with race handling built in. Hand-rolled
`isLoading` + `error` + `data` next to a fetch is re-implementing one,
badly. Rule of thumb: **server state → TanStack Query, UI flow →
`useReducer` + union, persisted status → one write path in a service.**

### Backend / data version

Same ideas, different tools:

- **Invariant** = a rule that must always hold across stored data, e.g.
  "an email on the suppression list ⇒ every contact with that email has
  `prijavljeni: false`".
- **One write path**: every transition goes through one service function
  that keeps the invariant. Nothing else writes those fields.
- **Repair** drifted data with a migration once the write path is fixed.

### Testing a machine

- **Red** = reproduce the bug through the real entry point, assert the
  *correct* behaviour, watch it fail.
- **Green** = smallest change that makes it pass.
- **Refactor** = clean up with the red→green proof still holding.
- A pure reducer (step 4) lives in a plain `.ts` file and can be tested with
  `vitest` alone — no browser, no React, no new packages:

  ```ts
  it.each([
    [{ status: "submitting", prijava }, { type: "CLOSE" }, "submitting"],
    [{ status: "failed", prijava, error: "x" }, { type: "SUBMIT" }, "submitting"],
  ])("%o + %o → %s", (s, e, expected) => {
    expect(certReducer(s, e).status).toBe(expected);
  });
  ```

- No bug, just mess? There's nothing to make red. Pin the current
  behaviour first (characterization), then refactor. Don't invent a failure
  to satisfy the ritual.

### When a library (XState etc.) earns its place

**Decision: write our own; no library.** A library pays off with nested
states, parallel regions, timers/delayed transitions, many interacting
async actors, or a diagram for non-devs. Nothing here has that:

- item 1 is a BE data invariant — a UI library doesn't touch it;
- items 2 and 4 are a deleted line / `disabled={isPending}`;
- items 3 and 5 are fixed by `useMutation` / `useQuery`, which we already
  have — TanStack Query *is* the state-machine library for server data.

"Our own" means a union type + a `switch` reducer (~20 lines) in a plain
`.ts` file, only where a real UI flow needs it — **not** a generic
machine helper. Revisit when racuni v2 persists invoices: the
predračun → avansni → konačni lifecycle is the first real candidate, and
should be modelled as an explicit status from day one.

---

## Testing approach

**Decision: BE gets automated tests; FE UI testing waits.**

- **BE** (item 1): normal `ied-be` service tests against
  `mongodb-memory-server` — already set up, no new dependencies.
- **FE** (items 2–5): red = written reproduction steps + reproduced in a
  real browser (screenshots/recording) before the fix; green = the same
  steps no longer reproduce. The fixes are one-liners or swaps to existing
  TanStack hooks, so an automated harness costs more than it protects.

### Why not component tests (Testing Library + jsdom) now

They'd need three dev packages: `jsdom` (a fake browser `document` inside
Node), `@testing-library/react` (renders a component there and finds
elements like a user would), `@testing-library/user-event` (realistic
clicks/typing). It is UI emulation — useful when there's lots of component
logic. Here the logic worth testing is in the BE.

### Component tests vs. Playwright

| | Testing Library + jsdom | Playwright |
|---|---|---|
| **What runs** | One component, in a fake browser inside Node | The whole app in a real Chrome/Firefox |
| **Backend** | Mocked (fake the hook / `api/*` call) | Real, or network faked with `page.route()` |
| **Speed** | ms per test, runs inside existing `vitest` | seconds per test, app must be running |
| **Catches** | Component logic: state, handlers, rendering | Real user flows: routing, layout, FE↔BE wiring |
| **Misses** | Real layout, real network, browser quirks | Little — but failures are harder to pinpoint |
| **Setup cost here** | 3 dev packages | 1 package + browser binaries + running app + **Clerk login** |

Clerk is the real cost: every page is behind sign-in and every `/api` route
behind `requireApiAuth`, so Playwright must log in a test user first (Clerk
ships testing helpers, but it's setup work before test #1).

**When we do add UI tests: Playwright, not jsdom.** This CRM has a handful
of flows that matter (search firme, add zaposleni, prijava na seminar,
generate račun). 5–10 Playwright journeys over those give more confidence
than many small component tests, and `page.route()` can still force errors
and out-of-order responses (items 2 and 5). Its own PR, Clerk login solved
first.

---

## Part 2 — The machines in this codebase

Ordered by impact. Each section: where, the real states, what's wrong, how
to prove it (red), how to fix it (green), cleanup (refactor).

### 1. Mailing-list subscription — data drift (BE)

**Intended design** (owner's description):

- Every contact — firma **or** zaposleni, same rules for both — has
  `prijavljeni: true` (gets all our emails) or `false`.
- `email_suppressions` holds emails with a reason: `UNSUBSCRIBED`,
  `HARD_BOUNCE`, `SPAM_COMPLAINT`. Filled by CSV upload
  (`PUT /api/email-suppression/add-csv-list`) and single adds
  (`PUT /add-email`). Uploads are emails only — no firma/zaposleni ids.
- Any email that lands on the list → every contact with that email becomes
  `prijavljeni: false`.
- `HARD_BOUNCE` / `SPAM_COMPLAINT` are **permanent**: can never be switched
  back to `true`, never downgraded to `UNSUBSCRIBED` by a later upload; a
  warning shows under the email field; never exported.
- `UNSUBSCRIBED`: the toggle may re-subscribe — that removes the email from
  the list and sets `prijavljeni: true` on **every** contact with that
  email (rules are per email, not per contact).

**Real states** of a contact:

| State | `prijavljeni` | suppression row for its email |
|---|---|---|
| subscribed | `true` | none |
| unsubscribed | `false` | `UNSUBSCRIBED` (or none — set by hand / legacy) |
| blocked | `false` | `HARD_BOUNCE` / `SPAM_COMPLAINT` |
| **impossible** | `true` | any row |

Invariant: **email on the suppression list ⇒ every contact with that email
has `prijavljeni: false`.**

**Code vs. design:**

| Rule | Today |
|---|---|
| Upload / `add-email` → matching contacts become `prijavljeni: false` | ❌ only the suppression row is written |
| Bounce/spam can't switch to `true` | ✅ toggle refuses (`useEmailSuppression`); BE save forces `false` |
| Warning under the email field | ✅ |
| Suppressed never exported | ✅ `withoutSuppressed` |
| Unsubscribed → toggle on removes from list | ✅ |

**Consequence of the ❌:** after an upload, search with
`firmaPrijavljeni` / `zaposleniPrijavljeni: "subscribed"` still returns
those contacts, the switch shows "on" (for `UNSUBSCRIBED` the form flips it
client-side but never saves), and search count ≠ export count.

**API change — request shapes unchanged** (all in
`ied-be/src/services/email_suppression.service.ts`):

- One write path, `setPrijavljeniForEmails(emails, value)`: sets
  `prijavljeni` on every firma and zaposleni whose `e_mail` matches.
  **Case-insensitive** (`collation: { locale: "en", strength: 2 }`, also
  applied to the zaposleni `arrayFilters`) because suppression emails are
  stored lowercase and contact emails as typed (only trimmed).
- `addSuppressedEmail` (behind `add-csv-list` and `add-email`): after each
  chunk's upsert → `setPrijavljeniForEmails(chunk, false)`.
  - Permanent reasons: `HARD_BOUNCE` / `SPAM_COMPLAINT` rows use `$set`;
    `UNSUBSCRIBED` rows use `$setOnInsert`, so they only create, never
    overwrite. Within one upload, a permanent reason beats `UNSUBSCRIBED`
    in either order; otherwise the last row still wins.
- `removeSuppressedEmail` (behind `DELETE /remove-email`, used by the
  re-subscribe toggle): permanent reason → returns `null`, route answers
  **409** (new). Otherwise deletes the row and
  `setPrijavljeniForEmails([email], true)`. The delete filters on
  `reason: { $nin: permanent }`, so it can never remove a bounce/spam row,
  even one upgraded a moment earlier. No row at all (legacy unsubscribed)
  still re-subscribes.
  - **Known race, accepted:** a re-subscribe and a bounce/spam upload for
    the *same email in the same milliseconds* can end with contacts `true`
    while the row is permanent. Not worth a transaction (needs a replica
    set + retry logic): export filters through `withoutSuppressed`, so no
    mail is sent, and the next contact save forces `false`. Cheap fix if it
    ever matters: after setting `true`, re-check the row and set `false`
    if one appeared — converges in every interleaving.
- Migration `202611131200_sync_prijavljeni_with_email_suppressions.ts`:
  `prijavljeni: false` once for every email already on the list. Safe to
  re-run (verified by running it twice against the in-memory DB). Past
  downgrades (bounce overwritten by an unsubscribe) can't be recovered.
- No change to the FE toggle. Switching off calls `add-email`, which now
  updates the DB immediately, so "toggle off → cancel form" no longer
  leaves a contact `true` with a suppression row. "Toggle on → cancel"
  now leaves the contact subscribed (the toggle already wrote it) — the
  toggle has always written immediately; the form save only repeats it.

**Red** — `ied-be/tests/services/email_suppression.service.test.ts`, all
five failed on their assertions before the fix:

1. Upload `HARD_BOUNCE` for `SYNC.TEST@firma.rs` → firma `Sync.Test@Firma.rs`
   and a zaposleni `sync.test@FIRMA.rs` in another firma become `false`;
   contacts with other emails stay `true`.
2. Existing `HARD_BOUNCE` / `SPAM_COMPLAINT` + later `UNSUBSCRIBED` upload →
   reason unchanged.
3. Same email twice in one upload, permanent + `UNSUBSCRIBED` in either
   order → permanent wins.
4. Re-subscribe an `UNSUBSCRIBED` email → row gone, firma and zaposleni
   with that email (any case) become `true`.
5. Re-subscribe a `HARD_BOUNCE` email → `null`, row and `false` stay.

Search/export filters read the same `prijavljeni` field and
`withoutSuppressed`, so they're covered by asserting the stored value.

**Green:** `setPrijavljeniForEmails` + the permanent-reason rules above.

**Refactor:** collapse the four copy-pasted "if suppressed then
`prijavljeni = false`" blocks in `firma.service.ts` (`create`,
`updateFirmaById`, `createZaposleni`, `updateZaposleni`) into one helper.


### 2. `Firma` page dialogs — dialog closes before save finishes (FE)

**Where:** `ied-fe/src/pages/Firma.tsx` — `selectedRow`,
`openZaposleniDialog`, `openPrijavaNaSeminarDialog`.

**Real states:** `idle` · `creating` · `editing(row)` · `saving(row?)` ·
`saveFailed(row?, error)` · `registering(row)`.

**What's wrong:** `handleZaposleniSubmit` ends with an unconditional
`setOpenZaposelniDialog(false)` (line 155). `mutate()` is async, so the
dialog closes *before* the request finishes. The `onError` path that is
meant to keep it open never can; on a failed save the user's input is gone.

**Red (browser):** open a firma → "Dodaj zaposlenog" → fill the form →
make the save fail (e.g. BE stopped, or invalid data the BE rejects) →
submit. Today: dialog closes, input lost, error alert shows.

**Green:** delete line 155. Same steps: dialog stays open with the input.

**Refactor:** pass `mutation.isPending` to the dialog to disable submit
while saving. A reducer only if the page grows more dialog states.

### 3. Certificate dialog — duplicated, redundant flags (FE)

**Where:** `components/Seminari/PrijaveSeminarTable.tsx` (lines 46–52) and
`components/Seminari/SeminariTableActionCell.tsx` (lines 55–58).

**Real states:** `closed` · `open(prijava?)` · `submitting` · `failed(error)`
(the worked example in Part 1).

**What's wrong:** no bug found. `isCertificateDialogOpen` duplicates
`selectedPrijava !== null` in `PrijaveSeminarTable`; `isSubmitting` /
`submitError` re-implement `useMutation`; both files call `api/docx.api`
directly (known tech debt).

**Red:** none — nothing is broken. Characterization (browser): submit
failing → error shown, dialog open; close while submitting → still open;
submit OK → closed. Re-check after the refactor.

**Refactor:** `useGenerateSertifikat()` mutation hook in `hooks/seminar/`
(gives `isPending`, `error`, `reset`), and the open/selected pair becomes
one `useState<PrijavaZodType | null>`. No reducer needed.

### 4. `PrijavaNaSeminarDialog` — dead state, double submit (FE)

**Where:** `components/Dialogs/PrijaviZaposlenogNaSeminar.tsx`,
`prijavaState: "" | "success" | "warning" | "error"`.

**What's wrong:**

- `"success"` is never set — dead state.
- `"warning"` / `"error"` duplicate `createPrijavaMutation.error`
  (`error.cause === "duplicate"` → warning).
- "Sačuvaj prijavu" isn't disabled while the mutation is pending → double
  click sends two requests.

**Red (browser):** throttle the network, double-click "Sačuvaj prijavu",
see two `POST`s in the network tab.

**Green:** `disabled={… || createPrijavaMutation.isPending}`.

**Refactor:** delete `prijavaState`; derive the alerts from
`createPrijavaMutation.error`; call `createPrijavaMutation.reset()` in the
on-open reset instead of `setPrijavaState("")`.

### 5. `PretrageRacuna` — hand-rolled fetch, race + swallowed errors (FE)

**Where:** `components/Racun/PretrageRacuna.tsx` — `loading`,
`racuniData` + `useEffect` calling `searchRacuni`.

**Real states:** `loading` · `success(data)` · `error` — but there is no
error state, and no cancellation.

**What's wrong:**

- Failed fetch → `console.error`, table shows empty = looks like "no
  results".
- Page fast: request for page 1 resolves after page 2 → page 1 rows shown
  under page 2's pager.

**Red (browser):** stop the BE → open Računi → empty table, no error. Race:
throttle the network, click next page twice quickly, watch rows vs. pager.

**Green:** `useSearchRacuni(searchState)` in `hooks/racun/useRacunQueries.ts`
with `searchState` in the query key. TanStack Query drops stale responses
by key. Render an `Alert` on `isError`.

`placeholderData: keepPreviousData` keeps `rowCount` (and so the pager)
stable while the next page loads — without it `totalDocuments` drops to 0
and the pager jumps. But it also keeps the *previous page's rows* under the
*new* page number, which is the same mismatch this item fixes. So the table
must not show placeholder rows as real ones:

```ts
state: {
  pagination: searchState.pagination,
  isLoading: isPending,          // first load
  showProgressBars: isFetching,  // as FirmasTable does
  showSkeletons: isPlaceholderData, // hide old rows while the new page loads
},
```

Pager = requested page, body = skeletons until that page's rows arrive.

**Refactor:** remove `loading` / `racuniData` state and the effect.

### Explicit already — leave alone

- `RacunV2/hooks/useRacunV2ReviewConfirmation.ts` — clean two-state
  machine, documented.
- `RacunV2/hooks/useRacunV2SeminariPrefill.ts` — explicit
  `loading`/`ready`; `status` + `prefill` + `errorMessage` could be one
  union, not worth a PR.

---

## Decisions made

1. **Bounce/spam are permanent** — an upload never downgrades them, and
   re-subscribe is refused (409).
2. **Re-subscribe flips every contact with that email** to `true`.

## PR order

| # | PR | Proof |
|---|---|---|
| 1 | `fix(ied-be)`: suppression upload sets `prijavljeni: false` on matching firme + zaposleni, + migration (item 1) | BE test, red first |
| 2 | `fix(ied-fe)`: keep zaposleni dialog open on failed save (item 2) | browser repro |
| 3 | `fix(ied-fe)`: racuni search via `useQuery` (item 5) | browser repro |
| 4 | `fix(ied-fe)`: prijava dialog double submit (item 4) | browser repro |
| 5 | `refactor(ied-fe)`: certificate dialog via mutation hook (item 3) | browser characterization |
