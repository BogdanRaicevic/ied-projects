# Racuni V2 - Rewrite Plan

Independent V2 rewrite of the invoicing system. Built in phases to avoid fake progress.
Phase 1 is **UI-only, minimum viable**. No DB writes, no DOCX, no new backend code.

---

## Review verdict on previous plans

What was wrong with the earlier passes:

- Mixed **POC UX** and **full backend migration** into one backlog.
- Proposed save/search endpoints while the explicit request was UI-first.
- Avansni behavior was contradictory (both stavke-based and amount-only implied).
- "Validiraj podatke" was a developer debug button dressed up as a user feature.
- Punted on tab-switch preservation ("preserve when useful" = no decision).
- Didn't resolve entry points, seminar-add semantics, or prefill ownership.
- Over-engineered Phase 1 with smart accordion behavior, seminar search dialog, polished preview, undo toasts, click-to-jump summary — all things that belong in UX polish, not POC.

This rewrite resolves all of the above and cuts Phase 1 to what's actually needed to prove the concept.

---

## Locked decisions

### Product

- V2 lives at `/racuni-v2`, fully independent from V1.
- V1 `/racuni` stays untouched and continues to be the production flow.
- **All 4 invoice types** have tabs: `predracun`, `avansniRacun`, `konacniRacun`, `racun`.
- `Pretrage` tab is rendered as **disabled** with "Uskoro" tooltip (placeholder).
- Line item types for Phase 1: `usluga` (service with online/offline split, optionally sourced from seminar) and `proizvod` (physical goods). Discriminator (`tipStavke`) is extensible for future types.
- `pozivNaBroj` in **Phase 1**: manual text input, required, no DB so no uniqueness check. In **Phase 2** it flips to auto-generated via V1's existing sequence mechanism (`SequenceModel` + pre-save hook), and uniqueness is enforced via compound unique index `{ "izdavac.id", tipRacuna, pozivNaBroj }`.
- Avansni in Phase 1 is **amount-only**: no stavke section.
- Konacni's `linkedPozivNaBrojevi` is a dynamic list of plain text inputs (multi-avansni support); no lookup/validation yet. Real avansni lookup, ObjectId linking (`linkedAvansniIds`), and primalac+izdavac-match constraints all land in Phase 3.
- PDV rate (`stopaPdv`) is **per-stavka** (supports mixed-rate invoices like usluga 20% + proizvod 10%). Default 20 on new stavke. Invoice-level "default PDV rate" is a UI convenience only — not stored on the invoice. Rounding is per-line, matching V1 accounting behavior.
- **PDV obveznik:** `izdavac.pdvObveznik: boolean` is snapshotted from the izdavac configuration. When `false` (e.g. `permanent` currently), calculators force all stavka PDV to 0 and DOCX omits the PDV block. Replaces V1's DOCX-render-time `shouldRenderPdvBlock` hack with a proper data-level field.
- **Primalac can be firma OR physical person.** `primalacRacuna.tipPrimaoca: "firma" | "fizicko"`. `firma`: `pib` + `maticniBroj` + `naziv` required; `firma_id` optional ref. `fizicko`: `naziv` + `adresa` required; `pib`/`maticniBroj` absent; `jmbg` optional (only needed over legal threshold).
- **Konacni links to multiple avansni (1 konacni -> N avansni).** A konacni can reference MULTIPLE avansni payments (`linkedAvansniIds: ObjectId[]` in Phase 3, `linkedPozivNaBrojevi: string[]` in Phase 1). Sum of referenced `avans` amounts is deducted from konacni totals.
- **`jedinicaMere`:** every stavka has a unit-of-measure label for DOCX rendering. `usluga` defaults to `"Broj ucesnika"` (hidden in UI). `proizvod` defaults to `"Broj primeraka"` (editable in UI).
- Avansni math: user types `avansBezPdv`; `avansPdv` and `avans` are derived read-only.
- **Currency (Phase 1-2 — inert scaffold + blocked submit):** `valuta` picker has exactly two options, `RSD` (default) and `EUR`. The picker is a visual scaffold: it stores the chosen value in form state, the summary panel renders the selected symbol/code next to totals, and selecting `EUR` shows a dismissible warning banner at the top of the form: *"Prikaz valute je samo vizuelni. NBS kurs, PDV režim izvoza (mesto prometa) i dvojezičan DOCX dolaze u Phase 6."* No NBS kurs input, no `pdvRezim` selector, no RSD rekapitulacija, no calculator behavior change. **Until Phase 6, submit is blocked when `valuta === "EUR"`; user must switch back to `RSD` to continue.** Real foreign-currency export lives in **Phase 6**; Phase 2 lands only defensive schema hooks so Phase 6 is not a migration. Rationale: avoids shipping a "looks-functional, computes-wrong" state — the worst possible UX for an accounting tool.
- No persistence between refreshes.

### UX behavior

- **Entry points:** direct `/racuni-v2` (blank form) AND from Seminari page with prefill.
- **Prefill:** when arriving from Seminari/prijave, auto-fill primalac from firma, first `usluga` stavka from seminar, and `onlineKolicina`/`offlineKolicina` from count of `prijave.prisustvo`. All fields remain editable.
- **Add usluga (Phase 1):** "+ Dodaj uslugu" appends an empty manual `usluga` stavka. (Seminar search dialog with DB prefill is Phase 4 polish.)
- **Add proizvod:** "+ Dodaj proizvod" appends an empty proizvod stavka.
- **Remove stavka:** simple instant remove. No confirmation, no undo.
- **Stavka cards (Phase 1):** all stavke **always expanded**. No collapse logic. Accordion polish is Phase 4.
- **Tab switch preservation:** preserve **only `izdavacRacuna`, `tekuciRacun`, and `valuta`**. Everything else resets, including `defaultStopaPdv` (returns to default for the target tab). Rationale: currency is a per-session issuer decision, not a per-invoice-type decision — forcing the user to re-pick `EUR` on every tab switch is user-hostile.
- **Validation mode:** `onTouched` — field validates on first blur, then live on every keystroke once touched. Implemented via RHF `mode: "onTouched"` + `shouldFocusError: true`.
- **Validation display:** inline per-field errors (RHF standard). On submit with errors: RHF auto-focuses first invalid field, toast shows summary count.
- **Final CTA:** "Potvrdi i pregledaj" — on success, shows a success toast + payload drawer (JSON, DEV-only). Polished read-only preview screen is Phase 4; real save flow arrives in Phase 2.

### MUI interaction contract (locked)

- `Pretrage` tab stays disabled in Phase 1-2 and keeps tooltip `"Uskoro"` using a wrapper element (`span`/`Box`) so tooltip works on disabled controls.
- Currency warning is a global MUI `Alert` above the form cards, not hidden in a field helper text.
- Submit guard for EUR is visible and explicit: inline `Alert` + submit-level feedback; no silent fallback to RSD.
- Duplicate `linkedPozivNaBroj` warning (Phase 3) is non-blocking UX copy with explicit user confirmation path.

### UX acceptance criteria for locked behavior

- If `valuta === "EUR"`, submit cannot complete and the user sees clear guidance to switch to `RSD`.
- If `valuta === "RSD"`, submit follows normal validation flow (`onTouched`, focus first invalid field, summary toast).
- Switching tabs preserves only `izdavacRacuna`, `tekuciRacun`, `valuta`; `defaultStopaPdv` is reset.
- The summary panel always shows selected currency code, but never implies conversion before Phase 6.

### Engineering

- **Form state:** `react-hook-form` + `zodResolver`. Zero Zustand in V2.
- **Stavke:** `useFieldArray` with discriminated union schema on `tipStavke`.
- **Calculations:** pure functions in **`ied-shared/src/calculations/racuniV2/`** from day one, consumed by FE `watch()`-based hook and (in Phase 2) by BE services. Unit tested. This prevents V1's duplicate-calc-between-FE-and-BE sin.
- **Reuse V1 read-only API wrappers** (`fetchSingleFirma`, `fetchSeminarById`, `useFetchIzdavaciRacuna`). Rebuild all UI components for V2.
- **MUI v7** stays. Use existing `@mui/material`, `@mui/x-date-pickers`. No new UI libs.
- **Directory isolation:** everything V2 lives under `ied-fe/src/components/RacunV2/` and `ied-fe/src/pages/RacuniV2.tsx`. Zero imports from `components/Racun`.

---

## Design direction

Target: desktop admin tool, dense but scannable, running totals always visible.

### Layout (two-column, sticky summary)

```
+------------------------------------------------------+
| PageTitle: Racuni V2                                 |
+------------------------------------------------------+
| Tabs: Pretrage(disabled) | Predracun | Avansni | ... |
+-----------------------------+------------------------+
| FORM COLUMN (~65%)          | SUMMARY (~35% sticky)  |
|                             |                        |
|  [ Izdavac Racuna card ]    |  Ukupno:               |
|  - izdavac select           |    poreska osnovica    |
|  - tekuci racun             |    ukupan PDV          |
|  - pozivNaBroj              |    ukupna naknada      |
|  - defaultStopaPdv          |                        |
|    (prefills new stavke)    |  Po stavci:            |
|                             |    usluga A ... XYZ    |
|  [ Primalac Racuna card ]   |    usluga B ... XYZ    |
|  - tipPrimaoca toggle       |    proizvod C ... XYZ  |
|  - naziv, pib/jmbg, ...     |                        |
|                             |                        |
|  [ Stavke card ]            |                        |
|   [+ Dodaj uslugu]          |  Validacija:           |
|   [+ Dodaj proizvod]        |    2 polja nisu        |
|                             |    ispravna            |
|   [ Seminar 1 (expanded) ]  |                        |
|   [ Seminar 2 (expanded) ]  |  [ Potvrdi i pregledaj]|
|   [ Proizvod 1 (expanded) ] |                        |
|                             |                        |
|  [ Type-specific card ]     |                        |
|  (rokZaUplatu / placeno /   |                        |
|   datumUplateAvansa /       |                        |
|   linkedPozivNaBrojevi[])   |                        |
+-----------------------------+------------------------+
```

### Stavka card behavior (Phase 1)

- All stavka cards are **always expanded** (no accordion collapse).
- Each card is a bordered `Card` with the form fields visible.
- Delete button on each card does an instant remove.
- Collapsible/accordion polish with smart auto-expand is Phase 4.

### Avansni tab layout

Avansni is different — no stavke section, simpler layout:

```
[ Izdavac Racuna card ]
[ Primalac Racuna card ]
[ Avans amounts card ]
   - avansBezPdv (editable)
   - avansPdv (derived, read-only)
   - avans (derived, read-only)
   - datumUplateAvansa (DatePicker)
```

Summary column still present with the 3 avans values.

---

## Data model (Phase 1, frontend-only)

```ts
type TipStavke = "usluga" | "proizvod"; // extensible

type StavkaUsluga = {
  tipStavke: "usluga";
  seminar_id?: string;
  naziv: string;
  datum: Date;
  lokacija?: string;
  jedinicaMere: string;         // default "Broj ucesnika", hidden in UI
  onlineKolicina: number;
  onlineCena: number;
  offlineKolicina: number;
  offlineCena: number;
  popust: number;               // 0-100
  stopaPdv: number;             // per-stavka; default 20
};

type StavkaProizvod = {
  tipStavke: "proizvod";
  naziv: string;
  jedinicaMere: string;         // default "Broj primeraka", editable
  kolicina: number;
  cena: number;
  popust: number;
  stopaPdv: number;             // per-stavka; default 20
};

type Stavka = StavkaUsluga | StavkaProizvod;

type PrimalacFirma = {
  tipPrimaoca: "firma";
  firma_id?: string;
  naziv: string;
  pib: string;                  // required
  maticniBroj: string;          // required
  adresa?: string;
  mesto?: string;
};

type PrimalacFizicko = {
  tipPrimaoca: "fizicko";
  naziv: string;                // ime i prezime
  adresa: string;               // required
  mesto?: string;
  jmbg?: string;                // optional, depends on invoice value
};

type PrimalacRacuna = PrimalacFirma | PrimalacFizicko;

type RacunV2Form = {
  tipRacuna: "predracun" | "avansniRacun" | "konacniRacun" | "racun";
  izdavacRacuna: "ied" | "permanent" | "bs";
  tekuciRacun: string;
  pozivNaBroj: string;          // Phase 1: manual, required. Phase 2: auto-generated server-side.
  valuta: "RSD" | "EUR";        // Phase 1: inert scaffold, default "RSD". RSD + EUR only. Phase 6 lifts restrictions.
  defaultStopaPdv: number;      // UI convenience, default 20 — auto-fills new stavke, NOT stored on the invoice
  primalacRacuna: PrimalacRacuna;

  // Only for non-avansni types:
  stavke?: Stavka[];

  // Type-specific:
  rokZaUplatu?: number;         // predracun
  avansBezPdv?: number;         // avansni (avansPdv + avans derived; uses izdavac-default PDV rate)
  datumUplateAvansa?: Date;     // avansni
  linkedPozivNaBrojevi?: string[]; // konacni (text array in Phase 1; becomes ObjectId[] ref in Phase 3)
  placeno?: number;             // racun
};
```

Zod schema with discriminated union on `tipRacuna` and on `tipStavke` for stavke. Phase 1 Zod schema lives in `ied-fe/src/components/RacunV2/schema/` for iteration speed; it gets promoted to `ied-shared` in Phase 2 when contracts stabilize. **Calculators, however, live in `ied-shared` from day one** — they are the one piece that must be byte-identical between FE and BE.

---

## File structure (Phase 1)

```
ied-fe/src/
  pages/
    RacuniV2.tsx
  components/
    RacunV2/
      RacunV2FormProvider.tsx
      schema/
        racunV2.schema.ts             # Zod + TS types
        defaults.ts                   # default values per tipRacuna
      hooks/
        useRacunV2Form.ts             # typed useFormContext wrapper
        useRacunV2Calculations.ts     # pure calc consumers
      # NOTE: calculators live in ied-shared/src/calculations/racuniV2/ (NOT here)
      #   - calculators.ts               pure functions, consumed by FE + BE
      #   - calculators.test.ts          unit tests
      sections/
        IzdavacRacunaSection.tsx
        PrimalacRacunaSection.tsx
        StavkeSection.tsx
        AvansAmountsSection.tsx       # avansni-specific
        TypeSpecificSection.tsx       # rokZaUplatu / placeno / linkedPozivNaBroj
        SummaryPanel.tsx              # sticky right column
      stavke/
        UslugaStavkaCard.tsx
        ProizvodStavkaCard.tsx
      forms/
        PredracunLayout.tsx
        AvansniLayout.tsx
        KonacniLayout.tsx
        RacunLayout.tsx
      RacunV2TabsShell.tsx            # tabs + layout chrome
      PayloadDrawer.tsx               # Phase 1 validated-payload viewer
```

No new backend files in Phase 1.

---

## Phase 1: UI-only POC

### Epic 1: Route, page shell, and tabs

#### Story 1.1: Add route and navigation
- [x] **Ticket 1.1.1:** Add `/racuni-v2` route in `ied-fe/src/App.tsx`.
- [x] **Ticket 1.1.2:** Create `ied-fe/src/pages/RacuniV2.tsx` with `PageTitle` and layout slot.
- [x] **Ticket 1.1.3:** Add nav entry "Racuni V2" next to existing "Racuni" link.

#### Story 1.2: Tabs shell
- [x] **Ticket 1.2.1:** Build `RacunV2TabsShell.tsx` with 5 tabs: `Pretrage (disabled, tooltip: Uskoro)`, `Predracun`, `Avansni`, `Konacni`, `Racun`.
- [x] **Ticket 1.2.2:** Tab change updates form state's `tipRacuna` and resets everything except `izdavacRacuna`, `tekuciRacun`, and `valuta` (explicitly resets `defaultStopaPdv`).

### Epic 2: Form engine and schema

#### Story 2.1: RHF provider and typed helpers
- [x] **Ticket 2.1.1:** Create `RacunV2FormProvider.tsx` with `useForm<RacunV2Form>({ resolver: zodResolver(...), mode: "onTouched", shouldFocusError: true })`.
- [x] **Ticket 2.1.2:** Create `useRacunV2Form.ts` — typed `useFormContext<RacunV2Form>()` wrapper.
- [x] **Ticket 2.1.3:** Create `schema/defaults.ts` with `getDefaultValues(tipRacuna)` returning correct defaults per type.

#### Story 2.2: Zod schema
- [x] **Ticket 2.2.1:** Create `schema/racunV2.schema.ts` with `StavkaUslugaZod`, `StavkaProizvodZod`, `StavkaZod` (discriminated on `tipStavke`). Set defaults: `usluga.jedinicaMere = "Broj ucesnika"` (hidden in UI), `proizvod.jedinicaMere = "Broj primeraka"` (editable in UI). Both stavka types include `stopaPdv: z.coerce.number().min(0).default(20)`.
- [x] **Ticket 2.2.2:** Create `PrimalacFirmaZod` (`tipPrimaoca: "firma"`, requires `naziv`, `pib`, `maticniBroj`) and `PrimalacFizickoZod` (`tipPrimaoca: "fizicko"`, requires `naziv`, `adresa`). `PrimalacRacunaZod = z.discriminatedUnion("tipPrimaoca", [...])`.
- [x] **Ticket 2.2.3:** Create `RacunV2Zod` (discriminated on `tipRacuna`): predracun/konacni/racun require `stavke.min(1)`; avansni disallows `stavke` and requires `avansBezPdv`. `pozivNaBroj` required and non-empty. `valuta: z.enum(["RSD", "EUR"]).default("RSD")` at the top level. Phase 1 does NOT add a schema refine on `valuta` — EUR blocking is handled at submit UX level (see Epic 8), while Phase 2 API adds the strict refine.
- [x] **Ticket 2.2.4:** Konacni accepts `linkedPozivNaBrojevi: z.array(z.string().min(1))` (can be empty in Phase 1; enforced at least 1 in Phase 3).
- [x] **Ticket 2.2.5:** Enforce `popust` 0-100, `kolicina`/`cena` non-negative, `stopaPdv` non-negative.

### Epic 3: Calculations (pure, testable, in ied-shared)

> All calculators go into `ied-shared/src/calculations/racuniV2/`. FE imports them directly; Phase 2 BE imports the same modules. Zero duplication.

#### Story 3.1: Pure calculators
> All calculators take a `{ pdvObveznik: boolean }` context. When `pdvObveznik === false`, every per-stavka `stopaPdv` is forced to `0` internally — callers don't have to remember.

- [x] **Ticket 3.1.1:** `calcSeminarStavkaSubtotal(stavka, { pdvObveznik })` returns `{ bruto, popustIznos, poreskaOsnovica, pdv, ukupno }`. Reads `stavka.stopaPdv` (per-stavka). Per-line rounding to 2 decimals, matching V1.
- [x] **Ticket 3.1.2:** `calcProizvodStavkaSubtotal(stavka, { pdvObveznik })` same return shape.
- [x] **Ticket 3.1.3:** `calcInvoiceTotals(stavke, { pdvObveznik }, tipRacuna, extras)` aggregates stavke subtotals AND returns a PDV-rate breakdown (`pdvPoStopama: Record<string, { osnovica, pdv }>`) for DOCX rekapitulacija. Applies `placeno` deduction for `racun` type.
- [x] **Ticket 3.1.4:** `calcAvansDerived(avansBezPdv, stopaPdv, { pdvObveznik })` returns `{ avansPdv, avans }` (plus `avansBezPdv` echoed back for caller convenience). Avansni uses a single `stopaPdv` input at the invoice level (no stavke → no per-stavka rate). Phase 1 lands the dedicated `stopaPdvAvansni` form field on the avansni branch (default 20) one phase early so semantics are correct from day one — `defaultStopaPdv` stays as the "auto-fill new stavke" UI helper.
- [x] **Ticket 3.1.5:** `calcKonacniDeduction(linkedAvansniAmounts: { avans, avansPdv, avansBezPdv }[])` returns the summed deduction for konacni totals. Phase 1 stub returns zeros (no real linking yet); Phase 3 wires real data. The `extras.konacniDeduction` injection point on `calcInvoiceTotals` is locked so Phase 3 wiring is a one-line change at the call site.
- [x] **Ticket 3.1.6:** Add unit tests — these are the one correctness-critical piece. Include fixtures for: mixed-rate invoice, `pdvObveznik=false` invoice, multi-avansni konacni. (`ied-shared/src/calculations/racuniV2/calculators.test.ts`, 20 tests, runnable via `pnpm -F ied-shared test:run`.)

#### Story 3.2: Calculation hook
- [x] **Ticket 3.2.1:** `useRacunV2Calculations()` subscribes via `watch` and returns totals + per-stavka subtotals. Memoized. Reads `pdvObveznik` from the shared `IZDAVAC_PDV_OBVEZNIK` map (single source of truth, ready for Phase 2's full izdavac config) and `stopaPdvAvansni` from form state for avansni invoices.

### Epic 4: Shared sections (Izdavac, Primalac, Summary)

#### Story 4.1: Izdavac Racuna section
- [ ] **Ticket 4.1.1:** Build `IzdavacRacunaSection.tsx` (card).
- [ ] **Ticket 4.1.2:** `izdavacRacuna` select (IED / Permanent / BS). On change, reset `tekuciRacun`.
- [ ] **Ticket 4.1.3:** `tekuciRacun` autocomplete fed by existing `useFetchIzdavaciRacuna` (read-only reuse).
- [ ] **Ticket 4.1.4:** `pozivNaBroj` text input, required (manual in Phase 1; becomes auto-generated in Phase 2).
- [ ] **Ticket 4.1.5:** `defaultStopaPdv` number input, default 20. Labeled "Podrazumevana stopa PDV-a (za nove stavke)". On change, does NOT mutate existing stavke — only auto-fills new ones when added. Hidden when izdavac is not a PDV obveznik (read from izdavac config).
- [ ] **Ticket 4.1.6:** `valuta` `Select` (MUI), two options only: `RSD` and `EUR`. Labeled "Valuta". Default `RSD`. Placed in the Izdavac card, immediately after `tekuciRacun`. **Inert scaffold** — does NOT change calculator behavior, does NOT affect per-stavka inputs, does NOT render kurs/NBS fields. Selecting `EUR` renders a dismissible `Alert severity="warning"` banner at the top of the form (above all cards): *"Prikaz valute je samo vizuelni. NBS kurs, PDV režim izvoza i dvojezičan DOCX dolaze u Phase 6."* Banner dismissal is session-local (not persisted). Selecting `RSD` hides the banner. Until Phase 6, selected `EUR` also activates submit blocking in Epic 8.

#### Story 4.2: Primalac Racuna section

**Schema decision (Phase 1):** the fizicko branch uses a dedicated `imeIPrezime` field instead of reusing `naziv` from the firma branch. Rationale: a discriminated union with the same key meaning two different things (company name vs person name) is a smell — it disables structural narrowing, allows nonsensical cross-branch carry-over (e.g. "ACME doo" preserved as a person's name), and forces awkward UI label reuse. Firma keeps `naziv` (matches V1's BE schema, so Phase 2 BE wiring is a 1:1 mapping for the firma case). The two name fields are now schema-distinct: `primalacRacuna.naziv` (firma only) and `primalacRacuna.imeIPrezime` (fizicko only). Phase 2 BE schema must declare the same shape.

- [x] **Ticket 4.2.1:** Build `PrimalacRacunaSection.tsx` (card). Top-of-card toggle (MUI `ToggleButtonGroup` or `RadioGroup`): **Firma** / **Fizičko lice**. Binds to `primalacRacuna.tipPrimaoca`.
- [x] **Ticket 4.2.2:** When `tipPrimaoca === "firma"`: render `naziv` (label "Naziv firme", required), `pib` (required), `maticniBroj` (required), `adresa`, `mesto`. `Controller` + MUI `TextField`.
- [x] **Ticket 4.2.3:** When `tipPrimaoca === "fizicko"`: render `imeIPrezime` (label "Ime i prezime", required), `adresa` (required), `mesto`, `jmbg` (optional, help text "Unosi se za račune iznad zakonskog praga").
- [x] **Ticket 4.2.4:** Switching `tipPrimaoca` prompts a confirm dialog if the user has any non-empty primalac field ("Sva polja primaoca će biti resetovana. Nastaviti?"), then replaces the whole `primalacRacuna` subtree with an empty target-tip shape via `setValue`. **Wipe-everything semantics** — no fields cross over, since after the schema decision above no user-input fields are shared by name across branches anyway. Confirm check is value-based (looks at current form values), not RHF `dirtyFields`-based: across a discriminated-union subtree replacement, RHF's per-key dirty diff incorrectly marks new-branch keys dirty against the old branch's defaults (e.g. `jmbg` after firma → fizicko), so a `dirtyFields` check would produce spurious confirm prompts.
- [x] **Ticket 4.2.5:** Accepts prefill from navigation state. Seminari prefill always sets `tipPrimaoca = "firma"` and populates `firma_id` + firma fields. All fields remain editable after prefill. *(Section is a thin RHF view layer — prefill happens upstream via form `defaultValues` / `reset` in Story 7.2; no section-level work required beyond rendering whatever's in form state, which it does.)*

#### Story 4.3: Summary panel (sticky right column)
- [ ] **Ticket 4.3.1:** Build `SummaryPanel.tsx`. Sticky on desktop, below form on narrow screens.
- [ ] **Ticket 4.3.2:** Show `ukupnaPoreskaOsnovica`, `ukupanPdv`, `ukupnaNaknada` (live from `useRacunV2Calculations`). Render the currency code next to each amount from `valuta` (e.g. `"1.234,00 RSD"` or `"1.234,00 EUR"`). Formatting uses a single shared `formatMoney(amount, valuta)` helper so Phase 6 has one place to add locale-aware formatting. Numbers themselves are not converted — the picker is inert.
- [ ] **Ticket 4.3.3:** Show per-stavka subtotals list (display only, no click interaction in Phase 1).
- [ ] **Ticket 4.3.4:** Show validation error count if form has errors.
- [ ] **Ticket 4.3.5:** Primary CTA button: "Potvrdi i pregledaj" (disabled while `formState.isSubmitting`).

### Epic 5: Stavke (line items)

#### Story 5.1: Stavke container and add buttons
- [ ] **Ticket 5.1.1:** Build `StavkeSection.tsx` using `useFieldArray({ name: "stavke" })`.
- [ ] **Ticket 5.1.2:** Two inline buttons: "+ Dodaj uslugu" appends empty `usluga` stavka with `stopaPdv = defaultStopaPdv` and `jedinicaMere = "Broj ucesnika"`; "+ Dodaj proizvod" appends empty `proizvod` stavka with `stopaPdv = defaultStopaPdv` and `jedinicaMere = "Broj primeraka"`.
- [ ] **Ticket 5.1.3:** Remove action per stavka: instant remove, no confirmation.

#### Story 5.2: Usluga stavka card
- [ ] **Ticket 5.2.1:** Build `UslugaStavkaCard.tsx` — bordered MUI `Card`, always expanded.
- [ ] **Ticket 5.2.2:** Fields: `naziv`, `datum` (MUI DatePicker), `lokacija`, `popust`.
- [ ] **Ticket 5.2.3:** Online group: `onlineKolicina`, `onlineCena`.
- [ ] **Ticket 5.2.4:** Offline group: `offlineKolicina`, `offlineCena`.
- [ ] **Ticket 5.2.5:** `stopaPdv` number input (per-stavka PDV rate). Hidden when izdavac is not a PDV obveznik.
- [ ] **Ticket 5.2.6:** `jedinicaMere` stays hardcoded to `"Broj ucesnika"` (no UI). Value is still written to form state so it survives to DOCX later.
- [ ] **Ticket 5.2.7:** Inline per-stavka subtotal display (bruto, popust, osnovica, PDV, ukupno).
- [ ] **Ticket 5.2.8:** Delete icon button in card header.

#### Story 5.3: Proizvod stavka card
- [ ] **Ticket 5.3.1:** Build `ProizvodStavkaCard.tsx` — bordered MUI `Card`, always expanded.
- [ ] **Ticket 5.3.2:** Fields: `naziv`, `jedinicaMere` (text input, default `"Broj primeraka"`), `kolicina`, `cena`, `popust`.
- [ ] **Ticket 5.3.3:** `stopaPdv` number input (per-stavka PDV rate). Hidden when izdavac is not a PDV obveznik.
- [ ] **Ticket 5.3.4:** Inline subtotal display.
- [ ] **Ticket 5.3.5:** Delete icon button in card header.

### Epic 6: Type-specific layouts

#### Story 6.1: Predracun layout
- [ ] **Ticket 6.1.1:** `PredracunLayout.tsx` composes Izdavac + Primalac + Stavke + TypeSpecific(`rokZaUplatu`).

#### Story 6.2: Avansni layout (special case, no stavke)
- [ ] **Ticket 6.2.1:** `AvansniLayout.tsx` composes Izdavac + Primalac + AvansAmountsSection.
- [ ] **Ticket 6.2.2:** `AvansAmountsSection.tsx`: `avansBezPdv` editable; `avansPdv` + `avans` read-only derived via `calcAvansDerived`; `datumUplateAvansa` DatePicker.

#### Story 6.3: Konacni layout
- [ ] **Ticket 6.3.1:** `KonacniLayout.tsx` composes Izdavac + Primalac + Stavke + `LinkedAvansniSection` (multi).
- [ ] **Ticket 6.3.2:** `LinkedAvansniSection.tsx` uses `useFieldArray({ name: "linkedPozivNaBrojevi" })` — user can add N rows, each a plain text input. "+ Dodaj avansni" appends empty. Remove icon per row.
- [ ] **Ticket 6.3.3:** Helper text under the list: "Veza sa avansnim računima (Phase 3: automatska validacija i oduzimanje avansa iz ukupne naknade)".
- [ ] **Ticket 6.3.4:** Phase 1 does NOT deduct avans from konacni totals (stub calculator returns zeros). The UI shows a note: "Avans se automatski oduzima od Phase 3".

#### Story 6.4: Racun layout
- [ ] **Ticket 6.4.1:** `RacunLayout.tsx` composes Izdavac + Primalac + Stavke + TypeSpecific(`placeno`).

### Epic 7: Entry flow and prefill

#### Story 7.1: Direct entry (blank form)
- [ ] **Ticket 7.1.1:** `/racuni-v2` with no navigation state → blank form, default tab = `predracun`.

#### Story 7.2: Entry from Seminari page
- [ ] **Ticket 7.2.1:** Add "Kreiraj V2 račun" action on `PrijaveSeminarTable` (alongside existing V1 action).
- [ ] **Ticket 7.2.2:** Navigate to `/racuni-v2` with `{ seminarId, prijave, firmaId }` in location state.
- [ ] **Ticket 7.2.3:** On mount in `RacuniV2.tsx`, if navigation state present: fetch firma (`fetchSingleFirma`), fetch seminar (`fetchSeminarById`), prefill `primalacRacuna` and first `usluga` stavka.
- [ ] **Ticket 7.2.4:** Prefill `onlineKolicina` from count of `prijave.prisustvo === "online"`, same for offline. All fields remain editable.

### Epic 8: Validation and submit

#### Story 8.1: Inline validation (onTouched mode)
- [ ] **Ticket 8.1.1:** All `Controller`-wrapped fields show helper text with error from RHF fieldState.
- [ ] **Ticket 8.1.2:** Confirm `mode: "onTouched"` is wired in the form provider (field validates on first blur, then live on every keystroke).

#### Story 8.2: Submit flow
- [ ] **Ticket 8.2.1:** "Potvrdi i pregledaj" triggers `handleSubmit`. On errors: RHF auto-focuses first invalid field; toast shows summary ("Ispravite označena polja (N)").
- [ ] **Ticket 8.2.2:** Add currency guard before success path: if `valuta === "EUR"`, block submit, keep form in edit mode, and show explicit guidance (`Alert` + toast) that EUR saves activate in Phase 6.
- [ ] **Ticket 8.2.3:** On success (only when `valuta === "RSD"`): show success toast and open `PayloadDrawer`.

#### Story 8.3: Payload drawer (Phase 1 deliverable, DEV-ONLY)
- [ ] **Ticket 8.3.1:** Build `PayloadDrawer.tsx` — MUI Drawer with pretty-printed JSON of the validated payload.
- [ ] **Ticket 8.3.2:** Copy-to-clipboard button. Close button returns to edit mode with data intact.
- [ ] **Ticket 8.3.3:** Gate the drawer and its submit wiring behind `import.meta.env.DEV`. In production builds, submit triggers a no-op toast ("Backend integracija — Phase 2"). Prevents accidental shipping of a JSON drawer to real users.

---

## Phase 1 recommended build order

1. Epic 1 (route, page shell, tabs)
2. Epic 2 (RHF + schema) + Epic 3 (calculators + tests) in parallel
3. Epic 4 (Izdavac, Primalac, Summary panel)
4. Epic 5 (Stavke cards — usluga + proizvod)
5. Epic 6 (four type layouts — Avansni is a different shape, flag it)
6. Epic 7 (seminari prefill flow)
7. Epic 8 (validation wiring + payload drawer)

End of Phase 1 = a fully interactive V2 UI that validates, shows the exact payload that would go to BE, and is ready to accept a real `onSubmit` handler in Phase 2.

---

## Phase 2: Backend and persistence

Goal: V2 can be saved, loaded, edited, and searched against a brand-new `racuni_v2` collection. V1 `racuni` stays untouched and live in parallel. No DOCX, no konacni↔avansni linking yet.

### Locked Phase 2 decisions

- **New collection:** `racuni_v2`. V1 `racuni` is read-only legacy. A unified collection is a later phase.
- **Money type:** keep JS `Number` + `roundToTwoDecimals` helper, matching V1 exactly. Decimal128 migration is deferred to Phase 5.
- **Single Mongoose model, no `discriminator()` on `tipRacuna`.** The `tipRacuna` field itself is preserved — required, enum-validated, indexed, searchable. What changes is that V1's four sub-schemas (each redeclaring `calculations`) collapse into one schema with optional fields per type, validated by Zod's discriminated union at the API boundary. All 4 legal invoice types remain distinct on every document.
- **Stavke use Mongoose sub-document discriminator on `tipStavke`** (`usluga` vs `proizvod`) — shapes genuinely differ, and new types are planned.
- **`status` field exists, no enforcement.** All new V2 docs default to `"izdat"`. Transitions and immutability hardening arrive in Phase 5.
- **`izdavac` is snapshotted** on the invoice from `izdavacRacuna.const.ts` at save time (including `pdvObveznik`), NOT resolved at DOCX-render time. Makes historical invoices stable against issuer info changes.
- **PDV rate is per-stavka** (`stopaPdv` on each stavka sub-doc). No invoice-level `stopaPdv` stored. Avansni, which has no stavke, stores one `stopaPdv` on the invoice document (it's the exception).
- **Primalac uses a `tipPrimaoca` discriminator** (`"firma" | "fizicko"`) with per-branch required fields.
- **Konacni→avansni linking is 1 konacni -> N avansni.** `linkedAvansniIds: ObjectId[]` on konacni. Phase 2 just stores the array; real lookup + constraints in Phase 3.
- **No stored `calculations` bucket.** Totals are derived on read via the shared calculators. Popust is an input on the stavka, never inside a "calculations" object.
- **No FE-vs-BE calculation comparison.** BE is the source of truth; it ignores any totals the FE sends.
- **Currency is an enum, locked to RSD at the API boundary.** `valuta: z.enum(["RSD", "EUR"])` in Zod, matching Mongoose enum. Phase 2 adds a Zod `.refine(v => v === "RSD")` that rejects EUR at the API layer, and FE submit remains blocked when EUR is selected (defense in depth). Phase 6 lifts both guards. Defensive hooks that land now (and only now, because changing them later is a schema migration): (a) `valuta` as enum not literal; (b) calculators accept `{ valuta }` in their context, unused internally; (c) optional reserved `pdvRezim` + `pdvRezimOsnov` on stavka; (d) optional reserved `izdavac.imaInostraniPromet` + `izdavac.ibanEur` on the izdavac snapshot; (e) DOCX templates render currency code from the invoice, never hardcode `"RSD"`/`"dinara"`. Zero runtime behavior change from any of these in Phase 2.

### Phase 2 data model (target shape for `racuni_v2`)

```ts
{
  _id,
  brojRacuna?: string,           // reserved; rollout completed in Phase 5
  pozivNaBroj: string,           // auto-generated via V1-style SequenceModel pre-save hook
  tipRacuna: "predracun" | "avansniRacun" | "konacniRacun" | "racun",  // required, indexed, searchable
  status: "izdat" | "placen" | "ponisten",   // default "izdat", no enforcement in Phase 2

  izdavac: {                     // SNAPSHOT, not a lookup
    id: "ied" | "permanent" | "bs",
    naziv, adresa, pib, maticniBroj, tekuciRacun,
    pdvObveznik: boolean         // snapshotted; drives PDV behavior everywhere
  },

  primalac:                      // discriminated on tipPrimaoca
    | { tipPrimaoca: "firma",    firma_id?: ObjectId, naziv, pib, maticniBroj, adresa?, mesto? }
    | { tipPrimaoca: "fizicko",  naziv, adresa, mesto?, jmbg? },

  stavke: [                      // discriminated on tipStavke
    { tipStavke: "usluga", seminar_id?, naziv, datum, lokacija?, jedinicaMere,   // default "Broj ucesnika"
      onlineKolicina, onlineCena, offlineKolicina, offlineCena, popust, stopaPdv },
    { tipStavke: "proizvod", naziv, jedinicaMere, kolicina, cena, popust, stopaPdv } // default "Broj primeraka"
    // future: | { tipStavke: "...", ... }
  ],

  valuta: "RSD" | "EUR",         // enum in schema; Phase 2 API refine rejects non-RSD; Phase 6 lifts the refine

  datumIzdavanja: Date,          // defaults to now on save
  datumValute?: Date,            // optional in Phase 2; frozen on issuance in Phase 5
  // datumPrometa: intentionally deferred (see Phase 5 / legal-hardening notes)

  rokZaUplatu?: number,          // predracun input (days)

  // Avansni is the exception — no stavke, so PDV rate lives on the invoice:
  avansBezPdv?: number,          // avansni
  stopaPdvAvansni?: number,      // avansni — only present when tipRacuna === "avansniRacun"
  datumUplateAvansa?: Date,      // avansni

  linkedAvansniIds?: ObjectId[], // konacni — ARRAY of refs, populated in Phase 3
  linkedPozivNaBrojevi?: string[], // konacni — kept alongside for DOCX rendering + fallback

  placeno?: number,              // racun

  created_at, updated_at,
  izdat_at?, ponisten_at?        // reserved; populated by Phase 5 transitions
}
```

### Epic P2-A: Shared schema and types

#### Story P2-A.1: Promote Phase 1 Zod schema to `ied-shared`
- [ ] **Ticket P2-A.1.1:** Create `ied-shared/src/types/racuniV2.zod.ts`. Move `StavkaUslugaZod`, `StavkaProizvodZod`, `StavkaZod` (discriminated on `tipStavke`, each with `jedinicaMere` + `stopaPdv`), `PrimalacFirmaZod`, `PrimalacFizickoZod`, `PrimalacRacunaZod` (discriminated on `tipPrimaoca`), `IzdavacSnapshotZod` (with `pdvObveznik`), and `RacunV2Zod` (discriminated on `tipRacuna`).
- [ ] **Ticket P2-A.1.2:** Add to `RacunV2Zod`: `status` enum (`izdat | placen | ponisten`, default `izdat`), `valuta: z.enum(["RSD", "EUR"]).default("RSD").refine(v => v === "RSD", "EUR saves land in Phase 6")`, `datumIzdavanja`, optional `datumValute`. Avansni branch: `avansBezPdv` + `stopaPdvAvansni`. Konacni branch: `linkedAvansniIds: z.array(ObjectIdString).default([])` and `linkedPozivNaBrojevi: z.array(z.string()).default([])`.
- [ ] **Ticket P2-A.1.2a:** Reserve optional `pdvRezim` and `pdvRezimOsnov` on `StavkaUslugaZod` and `StavkaProizvodZod`: `pdvRezim: z.enum(["redovan20", "redovan10", "izvozUsluga", "izvozDobara", "izuzetoBezPrava", "izuzetoSaPravom"]).optional()`, `pdvRezimOsnov: z.string().optional()`. Phase 2 FE/BE does not read, write, validate, or display these — they exist so Phase 6 backfills in a single `updateMany` rather than a sub-document schema migration.
- [ ] **Ticket P2-A.1.2b:** Reserve optional `imaInostraniPromet: z.boolean().optional()` and `ibanEur: z.string().optional()` on `IzdavacSnapshotZod`. Same rationale: defensive, unused in Phase 2.
- [ ] **Ticket P2-A.1.3:** Invariant check in `RacunV2Zod`: when `izdavac.pdvObveznik === false`, every `stavke[].stopaPdv` must be `0` AND `stopaPdvAvansni` must be `0`. Fail parse otherwise (BE is strict; FE mirrors the rule).
- [ ] **Ticket P2-A.1.4:** Export inferred TS types: `RacunV2Type`, `StavkaType`, `StavkaUslugaType`, `StavkaProizvodType`, `PrimalacRacunaType`, `PrimalacFirmaType`, `PrimalacFizickoType`, `IzdavacSnapshotType`, `PretrageRacunaV2Type`.
- [ ] **Ticket P2-A.1.5:** Delete the FE `components/RacunV2/schema/racunV2.schema.ts` and replace with a thin re-export from `ied-shared`. Update all FE imports.

#### Story P2-A.2: Shared calculators already in place
- [ ] **Ticket P2-A.2.1:** Confirm `ied-shared/src/calculations/racuniV2/calculators.ts` is importable by both FE and BE (no FE-only deps, no DOM refs).
- [ ] **Ticket P2-A.2.2:** Add a `calcRacunTotals(racun: RacunV2Type): TotalsType` pure function that BE will use in a read-DTO transform.
- [ ] **Ticket P2-A.2.3:** Extend every calculator's context from `{ pdvObveznik }` to `{ pdvObveznik, valuta }`. `valuta` is unused inside the function bodies in Phase 2 — the parameter exists to stabilize signatures so Phase 6 is a single-file change instead of a call-site sweep. Update all existing call sites to pass `valuta` (always `"RSD"` in Phase 2).

### Epic P2-B: Mongoose model and indexes

#### Story P2-B.1: Create `racunV2.model.ts`
- [ ] **Ticket P2-B.1.1:** Create `ied-be/src/models/racunV2.model.ts` with the schema shape above. **Single schema, no Mongoose `discriminator()` on `tipRacuna`.** `tipRacuna` is still a required, indexed enum field on every document. Collection name `racuni_v2`.
- [ ] **Ticket P2-B.1.2:** Define `izdavacSnapshotSchema` (sub-document) and embed it as `izdavac`. Fields: `id: { type: String, enum: [...], required: true, immutable: true }`, `naziv`, `adresa`, `pib`, `maticniBroj`, `tekuciRacun`, `pdvObveznik: { type: Boolean, required: true }`.
- [ ] **Ticket P2-B.1.3:** Define `primalacFirmaSchema` and `primalacFizickoSchema`. Embed `primalac` with `{ discriminatorKey: "tipPrimaoca" }`. Firma branch: `naziv`, `pib`, `maticniBroj` required, `firma_id` optional ref, `adresa`/`mesto` optional. Fizicko branch: `naziv`, `adresa` required, `mesto`, `jmbg` optional.
- [ ] **Ticket P2-B.1.4:** Define `stavkaUslugaSchema` and `stavkaProizvodSchema` with `{ discriminatorKey: "tipStavke" }`. Set schema defaults for `jedinicaMere`: `stavkaUslugaSchema -> "Broj ucesnika"`, `stavkaProizvodSchema -> "Broj primeraka"`. Keep `jedinicaMere: { type: String, required: true }` and `stopaPdv: { type: Number, required: true, min: 0 }` on both branches. Stavke is a sub-document array.
- [ ] **Ticket P2-B.1.5:** Add `status` field with enum + default `"izdat"`. Add TODO comment: *"Phase 5: enforce immutable docs for `status in ['placen','ponisten']`."*
- [ ] **Ticket P2-B.1.6:** Add timestamp options (`created_at`, `updated_at`). Add optional `izdat_at`, `ponisten_at` fields (reserved, not populated).
- [ ] **Ticket P2-B.1.7:** Add `valuta: { type: String, enum: ["RSD", "EUR"], default: "RSD", required: true }`. Mongoose enum matches the Zod enum; the API-layer Zod `.refine` is the only thing preventing EUR writes in Phase 2.
- [ ] **Ticket P2-B.1.7a:** On `izdavacSnapshotSchema`, add optional `imaInostraniPromet: Boolean` and `ibanEur: String`. Not set by Phase 2 save flow; reserved for Phase 6.
- [ ] **Ticket P2-B.1.7b:** On `stavkaUslugaSchema` and `stavkaProizvodSchema`, add optional `pdvRezim: { type: String, enum: ["redovan20", "redovan10", "izvozUsluga", "izvozDobara", "izuzetoBezPrava", "izuzetoSaPravom"] }` and optional `pdvRezimOsnov: String`. Not populated in Phase 2.
- [ ] **Ticket P2-B.1.8:** Avansni-specific fields at the invoice level: `stopaPdvAvansni: Number`, `avansBezPdv: Number`, `datumUplateAvansa: Date` (all optional on the schema; enforced per-type by Zod at the API layer).
- [ ] **Ticket P2-B.1.9:** Konacni-specific fields: `linkedAvansniIds: [{ type: Types.ObjectId, ref: "RacunV2" }]`, `linkedPozivNaBrojevi: [String]`. Both default to empty arrays.
- [ ] **Ticket P2-B.1.10:** Pre-save hook: if `izdavac.pdvObveznik === false`, zero out `stavke[*].stopaPdv` and `stopaPdvAvansni` as a belt-and-suspenders guard (Zod already enforces this; double-check at persistence).

#### Story P2-B.2: Indexes
- [ ] **Ticket P2-B.2.1:** Compound unique index: `{ "izdavac.id": 1, tipRacuna: 1, pozivNaBroj: 1 }`.
- [ ] **Ticket P2-B.2.2:** Secondary index on `{ "primalac.firma_id": 1, created_at: -1 }` for firma-scoped search.
- [ ] **Ticket P2-B.2.3:** Index on `{ status: 1, created_at: -1 }` for list views.

#### Story P2-B.3: `pozivNaBroj` generator
- [ ] **Ticket P2-B.3.1:** Pre-save hook identical to V1's — uses `SequenceModel` with key `${izdavac.id}_${tipRacuna}_${datePrefix}`, pads to 4 digits, prefixes `YYMM`. Reuse V1 logic; do NOT duplicate the `SequenceModel` itself.
- [ ] **Ticket P2-B.3.2:** Fire only when `isNew && !this.pozivNaBroj`. Matches V1 semantics so sequences remain consistent with V1 accounting.

### Epic P2-C: Services layer

#### Story P2-C.1: Create `racuniV2.service.ts`
- [ ] **Ticket P2-C.1.1:** Create `ied-be/src/services/racuniV2.service.ts`. Do NOT touch the V1 `racuni.service.ts`.
- [ ] **Ticket P2-C.1.2:** `saveRacunV2(racun)` — snapshot `izdavac` from `izdavacRacuna.const.ts` at save time (INCLUDING `pdvObveznik`; don't trust FE payload's `izdavac`). Compute `datumIzdavanja` server-side if not provided. Save document. Return the DTO with derived totals.
- [ ] **Ticket P2-C.1.2a:** Extend `izdavacRacuna.const.ts` with `pdvObveznik: boolean` per entry (`ied: true`, `bs: true`, `permanent: false`). One source of truth.
- [ ] **Ticket P2-C.1.3:** `updateRacunV2ById(id, racun)` — full update in Phase 2. Add a comment: *"Phase 5: reject updates for `status in ['placen','ponisten']`."* Re-snapshot `izdavac` if `izdavac.id` changed.
- [ ] **Ticket P2-C.1.4:** `getRacunV2ById(id)` — `findById`, attach derived `totals` via `calcRacunTotals`, return DTO.
- [ ] **Ticket P2-C.1.5:** `searchRacuniV2(pageIndex, pageSize, params)` — mirrors V1 `searchRacuni`, adds optional `status` filter (default: exclude `"ponisten"`). Returns `{ racuni, totalDocuments, totalPages }`.
- [ ] **Ticket P2-C.1.6:** `getRacunV2ByPozivNaBrojAndIzdavac(...)` — parity with V1, used by konacni linking in Phase 3.
- [ ] **Ticket P2-C.1.7:** Delete-method policy: do NOT add a hard-delete endpoint. Hard deletes on invoices are never correct; Phase 5 adds `ponistiRacunV2`.

#### Story P2-C.2: Query builder
- [ ] **Ticket P2-C.2.1:** Create `ied-be/src/queryBuilders/racuniV2QueryBuilder.ts`. Clone V1 logic, adapt field paths:
  - `seminar.naziv` → `{ stavke: { $elemMatch: { naziv: { $regex, $options: "i" } } } }` (matches usluga OR proizvod by naziv).
  - Primalac paths: `primalac.naziv`, `primalac.pib` (both branches have `naziv`; only `firma` branch has `pib`, so pib-search implicitly filters to firma primalac).
  - `izdavacRacuna` filter maps to `"izdavac.id"`.
  - Add optional `tipPrimaoca` filter (`"firma" | "fizicko"`).
  - Add `status` filter (default: exclude `"ponisten"`).

### Epic P2-D: Routes

#### Story P2-D.1: Create `racuniV2.routes.ts`
- [ ] **Ticket P2-D.1.1:** Create `ied-be/src/routes/racuniV2.routes.ts` mounted at `/api/racuni-v2`. Do NOT reuse V1 router.
- [ ] **Ticket P2-D.1.2:** `POST /save` with `validateRequestBody(RacunV2Zod)` → `saveRacunV2`.
- [ ] **Ticket P2-D.1.3:** `PUT /update/:id` with `validateRequestBody(RacunV2Zod)` → `updateRacunV2ById`.
- [ ] **Ticket P2-D.1.4:** `GET /:id` → `getRacunV2ById`.
- [ ] **Ticket P2-D.1.5:** `POST /search` → `searchRacuniV2`.
- [ ] **Ticket P2-D.1.6:** `GET /izdavaci` — reuse V1 handler verbatim (same izdavac constants).
- [ ] **Ticket P2-D.1.7:** Register router in `server.ts`.

### Epic P2-E: FE wiring — save, edit, load

#### Story P2-E.1: Replace payload drawer with real save
- [ ] **Ticket P2-E.1.1:** Add `ied-fe/src/services/racuniV2Service.ts` wrapper: `saveRacunV2`, `updateRacunV2`, `getRacunV2ById`, `searchRacuniV2`.
- [ ] **Ticket P2-E.1.2:** Change "Potvrdi i pregledaj" CTA copy to "Sačuvaj". In production it hits `saveRacunV2`; on success, navigate to `/racuni-v2/:id` (read view).
- [ ] **Ticket P2-E.1.3:** Keep `PayloadDrawer` behind `import.meta.env.DEV` as a debugging aid.

#### Story P2-E.2: Edit mode — load existing racun
- [ ] **Ticket P2-E.2.1:** Route `/racuni-v2/:id/edit` loads a racun, calls `reset(data)` on the form, enters edit mode. Submit → `updateRacunV2`.
- [ ] **Ticket P2-E.2.2:** Handle not-found with a redirect + toast.
- [ ] **Ticket P2-E.2.3:** Show "Poslednja izmena: …" meta in the page header (`updated_at`).

#### Story P2-E.3: Read view
- [ ] **Ticket P2-E.3.1:** Route `/racuni-v2/:id` renders a read-only layout with: primalac block, izdavac block, stavke table, totals, metadata (pozivNaBroj, status, created_at). Polished preview visuals are Phase 4.
- [ ] **Ticket P2-E.3.2:** Action buttons: "Izmeni" (→ edit route), disabled "Preuzmi DOCX" with "Phase 3" tooltip.

### Phase 2 definition of done

- `/racuni-v2` creates a doc in `racuni_v2`, returns with server-generated `pozivNaBroj`, stored with `status: "izdat"`, `izdavac` snapshotted.
- `/racuni-v2/:id` loads and renders it.
- `/racuni-v2/:id/edit` updates it.
- `POST /api/racuni-v2/search` returns paged results.
- V1 `/racuni` still works, untouched.
- No DOCX, no konacni linking, no search UI yet.

---

## Phase 3: Search, konacni linking, DOCX

Goal: V2 has feature parity with V1 for the actual user workflow — search existing racuni, link konacni to avansni properly, download DOCX.

### Epic P3-A: Search

#### Story P3-A.1: Search API
- [ ] **Ticket P3-A.1.1:** Extend `ied-shared/src/types/racuniV2.zod.ts` with `PretrageRacunaV2Zod` (clone V1's shape, add optional `status[]` filter).
- [ ] **Ticket P3-A.1.2:** Extend `racuniV2QueryBuilder.ts` to support the new params; `nazivStavke` becomes `stavke.naziv` via `$elemMatch`.
- [ ] **Ticket P3-A.1.3:** Confirm indexes from Epic P2-B.2 cover the common filters.

#### Story P3-A.2: Search page
- [ ] **Ticket P3-A.2.1:** `PretrageTab.tsx` in `RacunV2TabsShell` — remove the "Uskoro" tooltip, wire it up. Layout: filters panel + Material React Table with server-side pagination (mirror V1 UX).
- [ ] **Ticket P3-A.2.2:** Columns: `pozivNaBroj`, `tipRacuna`, `primalac.naziv`, `stavke count` + first stavka naziv, `ukupnaNaknada` (derived), `status`, `created_at`, actions (otvori / izmeni).
- [ ] **Ticket P3-A.2.3:** Row action "Otvori" → `/racuni-v2/:id`; "Izmeni" → `/racuni-v2/:id/edit`.

### Epic P3-B: Konacni ↔ Avansni linking (real refs, 1 konacni -> N avansni)

#### Story P3-B.1: BE lookup service
- [ ] **Ticket P3-B.1.1:** `getAvansniForLinking(pozivNaBroj, izdavacId)` — returns `{ _id, primalac, stavkeSummary, avansBezPdv, avansPdv, avans, stopaPdvAvansni, status, linkedKonacniPozivNaBroj? }` for an avansni racun matched by `(izdavac.id, pozivNaBroj)` with `tipRacuna === "avansniRacun"`. 404 if no match, 409 if status is `ponisten`.
- [ ] **Ticket P3-B.1.2:** `GET /api/racuni-v2/link/avansni?pozivNaBroj=...&izdavacId=...` route.
- [ ] **Ticket P3-B.1.3:** On konacni save, resolve every entry of `linkedPozivNaBrojevi` to a real `linkedAvansniIds` ObjectId. Validate:
  - All referenced avansni exist and are not `ponisten`.
  - All share the same `primalac` identity as the konacni (firma: same `firma_id`/`pib`; fizicko: same `naziv` + `jmbg` or a best-effort match the user confirms).
  - All share the same `izdavac.id`.
  - Reject 422 on any mismatch with a per-row error map.

#### Story P3-B.2: FE konacni linking UI (multi)
- [ ] **Ticket P3-B.2.1:** Upgrade `LinkedAvansniSection` (from Phase 1) to a lookup field list: each row has a text input + "Proveri" button that onBlur/onClick calls the lookup endpoint. On success, the row locks and displays a confirmation chip (pozivNaBroj, primalac, avans amounts).
- [ ] **Ticket P3-B.2.2:** "+ Dodaj još jedan avans" adds another row. Remove icon per row (unlinks that avansni).
- [ ] **Ticket P3-B.2.3:** Inline error per row for 404 / 409 / primalac-mismatch responses.
- [ ] **Ticket P3-B.2.4:** Summary panel shows an "Avansno plaćeno" subtotal = sum of all linked avans amounts.
- [ ] **Ticket P3-B.2.5:** If lookup returns `linkedKonacniPozivNaBroj`, show a non-blocking warning callout in that row ("Ovaj avans je već povezan sa konacnim {pozivNaBroj}."). User may still proceed after explicit confirmation (no hard block in this phase).

#### Story P3-B.3: Konacni calculator (wire real deduction)
- [ ] **Ticket P3-B.3.1:** `calcKonacniDeduction` (Phase 1 stub) becomes real: sums `avansBezPdv`, `avansPdv`, `avans` across all linked avansni. PDV-rate breakdown aggregates by each avansni's `stopaPdvAvansni`.
- [ ] **Ticket P3-B.3.2:** Guard: total avansno plaćeno must not exceed the konacni's ukupna naknada. Soft warning (not a hard error) in the UI; user confirms with a checkbox to save.
- [ ] **Ticket P3-B.3.3:** Unit tests: single avansni, multiple avansni with same rate, multiple avansni with mixed rates, avansno plaćeno > ukupna naknada edge case.

### Epic P3-C: DOCX rendering

#### Story P3-C.1: Template strategy
- [ ] **Ticket P3-C.1.1:** Design new templates per tipRacuna: `predracunV2.docx`, `avansniV2.docx`, `konacniV2.docx`, `racunV2.docx`. Keep V1 templates untouched for V1 route.
- [ ] **Ticket P3-C.1.2:** Define `flattenStavkeForDocx(stavke)` in `ied-shared` — `usluga` with both online/offline kolicina > 0 → 2 rows; `usluga` with only one → 1 row; `proizvod` → 1 row. Each row: `{ naziv, jedinicaMere, kolicina, cena, popust, poreskaOsnovica, pdv, ukupno }`.
- [ ] **Ticket P3-C.1.3:** DOCX renderer reads `izdavac` snapshot from the invoice (NOT from `izdavacRacuna.const.ts`). This is the fix for the V1 "changed address mutates old invoices" bug.
- [ ] **Ticket P3-C.1.4:** When `izdavac.pdvObveznik === false`, DOCX omits the entire PDV block and PDV rekapitulacija. Replaces V1's `shouldRenderPdvBlock` render-time conditional with a data-driven one.
- [ ] **Ticket P3-C.1.5:** Mixed-rate rekapitulacija: iterate over `pdvPoStopama` map from the calculator, render one row per distinct stopa (`"PDV 20%: osnovica X / PDV Y"`, etc.).
- [ ] **Ticket P3-C.1.6:** **No hardcoded currency strings in templates.** Every occurrence of `"RSD"`, `"dinara"`, `"din."`, currency symbols, etc. in the four Phase 3 DOCX templates must be rendered from `{{valuta}}` (plus a `formatCurrencyLabel(valuta)` helper in `ied-shared`). Phase 3 only ever renders `"RSD"` at runtime; the discipline is to keep the templates currency-agnostic so Phase 6 bilingual/EUR templates do not require re-authoring the base templates. Add a grep check in CI: `rg -w "RSD|dinara|din\\." ied-be/src/docx/templates-v2/` must return zero.

#### Story P3-C.2: Route + FE action
- [ ] **Ticket P3-C.2.1:** `POST /api/docx/v2/modify-template` — validates body against `RacunV2Zod`, picks template by tipRacuna, renders. Sanitize filename same as V1.
- [ ] **Ticket P3-C.2.2:** Enable "Preuzmi DOCX" button on the read view (`RacuniV2/:id`); blob download + filename from `pozivNaBroj_primalac`.
- [ ] **Ticket P3-C.2.3:** Sanity test: render each tipRacuna against a golden fixture and diff visually.

### Phase 3 definition of done

- V2 Pretrage tab works with server pagination.
- Konacni can be created by linking to an existing avansni by `pozivNaBroj`; totals deduct the avans correctly.
- Every V2 tipRacuna can be downloaded as a DOCX that uses the snapshotted `izdavac`.

---

## Phase 4 (later): UX polish

> Everything we deliberately cut from Phase 1. Revisit once the core flow is in production and we have real user feedback.

### Epic P4-A: Stavke UX
- **Collapsible accordion stavka cards** with smart behavior:
  - Newly added stavka auto-expands; previous auto-collapses if valid.
  - On submit with errors, cards with invalid fields auto-expand.
  - Collapsed card header shows naziv, subtotal, error badge.
- **Seminar search dialog** on "+ Dodaj uslugu" — search existing DB seminars, prefill stavka from selection.
- **Undo toast** on stavka removal (5s window to restore).
- **Drag-to-reorder** stavke.

### Epic P4-B: Summary panel polish
- **Click-to-jump:** clicking a per-stavka row in summary scrolls the form to and expands the matching card.
- **Clickable error list:** first N errors listed with jump-to-field behavior.
- **Error count badge** on collapsed stavka cards.

### Epic P4-C: Preview and submit polish
- **Polished read-only preview screen** (`RacunV2Preview.tsx`): clean invoice layout (primalac block, stavke table, totals) instead of JSON drawer.
- "Izmeni" button to return to edit state.
- JSON payload hidden behind a dev-only toggle.

### Epic P4-D: Nice-to-haves
- Keyboard shortcuts (Ctrl+Enter to submit, Esc to close drawer).
- Form autosave to localStorage for draft recovery.
- Warn-on-leave when form is dirty.
- Optional: inline validation mode toggle per user preference.

---

## Phase 5: Accounting hardening (deferred, but planned)

Everything in this phase is *correctness / integrity* work that we deliberately punted during Phases 2–3 to avoid boiling the ocean. These are not optional forever; they have to happen before V2 can fully replace V1.

### Epic P5-A: Monetary precision migration (`Number` → `Decimal128`)

#### Story P5-A.1: Schema migration
- [ ] **Ticket P5-A.1.1:** Switch monetary fields on `racunV2.model.ts` to `Schema.Types.Decimal128`: `stavke.*.stopaPdv`, `stavke.*.onlineCena`, `stavke.*.offlineCena`, `stavke.*.cena`, `stopaPdvAvansni`, `avansBezPdv`, `placeno`.
- [ ] **Ticket P5-A.1.2:** Write a one-shot backfill script that casts existing `Number` values to `Decimal128` in `racuni_v2`.
- [ ] **Ticket P5-A.1.3:** Add a FE helper `toNumber(d: Decimal128Like)` + `toDecimalString(n)` for the wire boundary.

#### Story P5-A.2: Calculators switch
- [ ] **Ticket P5-A.2.1:** Rewrite `ied-shared/src/calculations/racuniV2/calculators.ts` against a decimal library (`decimal.js` or similar) to keep FE and BE identical.
- [ ] **Ticket P5-A.2.2:** Unit tests: replay existing fixtures, assert identical rounded output to the `Number` version. Any delta must be documented and approved by accounting.

### Epic P5-B: Invoice lifecycle and immutability

#### Story P5-B.1: Transitions
- [ ] **Ticket P5-B.1.1:** `finalizeBrojRacunaV2(id)` service — validates status is `"izdat"` and `brojRacuna` is missing, generates `brojRacuna` via a new sequence `${izdavac.id}_racun_${year}`, snapshots derived totals into a stored `totals` sub-doc, sets `izdat_at` if missing.
- [ ] **Ticket P5-B.1.2:** `ponistiRacunV2(id, reason)` — allowed from `"izdat" | "placen"`; sets status `"ponisten"`, `ponisten_at`, stores reason in audit log.
- [ ] **Ticket P5-B.1.3:** `oznaciKaoPlacenRacunV2(id, paymentRef?)` — allowed from `"izdat"`, sets status `"placen"`.

#### Story P5-B.2: Immutability enforcement
- [ ] **Ticket P5-B.2.1:** `updateRacunV2ById` rejects with 409 if `status in ("placen", "ponisten")`.
- [ ] **Ticket P5-B.2.2:** Pre-update Mongoose hook as a belt-and-suspenders guard.
- [ ] **Ticket P5-B.2.3:** Append-only audit log collection `racuniV2_audit` — one doc per transition with `{ racunId, fromStatus, toStatus, actor, reason?, at }`.

#### Story P5-B.3: FE lifecycle actions
- [ ] **Ticket P5-B.3.1:** Read view shows status badge and contextual actions (Označi plaćenim / Poništi).
- [ ] **Ticket P5-B.3.2:** Disable "Izmeni" when status is `"placen"` or `"ponisten"`; show tooltip explaining why.

### Epic P5-C: V1 → V2 unified collection migration

#### Story P5-C.1: Backfill
- [ ] **Ticket P5-C.1.1:** One-shot migrator: read every `racuni` doc, transform to V2 shape.
  - V1's single `seminar` embedded object becomes `stavke: [{ tipStavke: "usluga", stopaPdv: <V1 invoice-level stopaPdv>, jedinicaMere: "Broj ucesnika", ... }]`.
  - V1's invoice-level `stopaPdv` pushes down onto the single stavka; invoice-level `stopaPdv` is dropped.
  - V1's stored `calculations` is discarded (recomputed on demand).
  - V1's `linkedPozivNaBroj: string` becomes `linkedPozivNaBrojevi: [value]` (wrapped to array) and resolved to `linkedAvansniIds: [ObjectId]` where a match exists (`izdavacRacuna + pozivNaBroj`); unresolved entries stay as strings only.
  - V1's `primalacRacuna` (no `tipPrimaoca`) becomes `{ tipPrimaoca: "firma", ... }` wholesale — legacy V1 data is always firma-shaped.
  - `izdavac.pdvObveznik` backfilled from the izdavac constant of the same era.
- [ ] **Ticket P5-C.1.2:** Status strategy for legacy docs: set `status: "izdat"` (they're historical / real).
- [ ] **Ticket P5-C.1.3:** Dry-run mode with a diff report. Accounting signs off before writing.
- [ ] **Ticket P5-C.1.4:** Execute against staging, validate sample DOCX output matches historical.
- [ ] **Ticket P5-C.1.5:** Execute in production behind a maintenance window. Keep V1 collection as `racuni_legacy` for 1 year.

#### Story P5-C.2: Cutover
- [ ] **Ticket P5-C.2.1:** Redirect `/racuni` → `/racuni-v2`. Remove V1 UI code.
- [ ] **Ticket P5-C.2.2:** Retire V1 routes, V1 model, V1 service. Delete `components/Racun/`. Delete `ied-shared/src/types/racuni.zod.ts`.

### Epic P5-D: Split `brojRacuna` vs `pozivNaBroj` (optional, do only if accounting asks)

Track this as a possibility, not a commitment. The V1 conflation has not caused a bug we know of, but it's a latent correctness issue. If accounting ever needs a proper `brojRacuna` (e.g. for fiscal register integration), this epic activates: add a second sequence, keep `pozivNaBroj` as a model-97-with-control-digit derivation. Otherwise leave it.

---

## Phase 6: Foreign-currency export invoices (deferred)

> Rare use case: IED issues an outgoing invoice to a foreign B2B client, in EUR (occasionally another currency). Domestic in-person seminars for foreign attendees stay on the Serbian PDV track — currency changes, PDV treatment does not. Real exports (online seminars consumed abroad, goods shipped abroad) shift to a non-standard `pdvRezim` with a cited legal basis. This phase activates Phase 2's reserved hooks and adds the NBS kurs + bilingual DOCX workstream.
>
> **Out of scope forever (in this plan):** incoming invoices from foreign vendors (`ulazna faktura` — separate module), multi-currency accounting in a non-RSD base (Serbian books are RSD, always), FX gain/loss tracking, EU-specific flows (VIES, OSS, reverse charge), SEF/e-faktura integration (separate forthcoming phase).

### Key architectural principle (read this before anything else)

**Currency and PDV treatment are orthogonal.** The picker and the `pdvRezim` are independent. A foreign client pays in EUR for a seat at a Belgrade seminar → `valuta: "EUR"`, `pdvRezim: "redovan20"`, 20% PDV. A foreign client pays in EUR for an online seminar consumed abroad → `valuta: "EUR"`, `pdvRezim: "izvozUsluga"`, 0% PDV, legal basis cited. Do not build a "foreign invoice checkbox" that flips both at once.

### Locked Phase 6 decisions

- `valuta` gains real values (`RSD | EUR` at minimum; `USD` only if requested). The Phase 2 Zod `.refine` restricting to RSD is removed.
- PDV on any foreign-currency invoice is **still reported in RSD** on the DOCX rekapitulacija. Law, not opinion.
- `kursNbs` is snapshotted on the invoice at save time (srednji kurs NBS na dan prometa) and never recomputed on read. Same rule as `izdavac` snapshot.
- `pdvRezim` is **per stavka**, not per invoice. A single invoice can legally mix a domestic `redovan20` line and an export `izvozUsluga` line.
- Bilingual DOCX (`jezikDokumenta: "sr" | "sr-en"`) is invoice-level, not currency-derived. An RSD invoice can be bilingual; an EUR invoice can be Serbian-only. Unlikely, but keep the concerns separated.
- No hard conversion of the input amounts. The user types amounts in `valuta`; DOCX renders RSD equivalents alongside.

### Epic P6-A: Currency on the wire

- [ ] **Ticket P6-A.1.1:** Remove the `.refine(v => v === "RSD")` from `RacunV2Zod`. Mongoose enum already includes `"EUR"`; no schema migration needed.
- [ ] **Ticket P6-A.1.2:** Add `kursNbs: { kurs: number, datum: Date, izvor: "nbs-srednji" | "manual" }` to `RacunV2Zod` and the Mongoose model. Required when `valuta !== "RSD"`; forbidden when `valuta === "RSD"` (Zod refine).
- [ ] **Ticket P6-A.1.3:** NBS kurs adapter: `ied-be/src/services/nbsKurs.service.ts`. Fetches daily srednji kurs from NBS (web service or scraper, TBD when activated — NBS publishes XML). Caches per `(currency, date)` in a tiny collection. Fallback: manual kurs entry with `izvor: "manual"` if the NBS fetch fails; flag on the invoice for audit.
- [ ] **Ticket P6-A.1.4:** Calculators return both invoice-currency totals AND RSD equivalents. `calcInvoiceTotals` now returns `{ ...invoiceCurrencyTotals, rsdEquivalents: { osnovica, pdv, ukupno } }`. RSD equivalents derive from `amount * kursNbs.kurs`, rounded per V2 rules.

### Epic P6-B: PDV regime per stavka

- [ ] **Ticket P6-B.1.1:** FE: add `pdvRezim` `Select` to `UslugaStavkaCard` and `ProizvodStavkaCard`. Options with labels:
  - `redovan20` — "20% PDV (redovna stopa)" (default)
  - `redovan10` — "10% PDV (snižena stopa)"
  - `izvozUsluga` — "Izvoz usluga (mesto prometa inostranstvo)"
  - `izvozDobara` — "Izvoz dobara (sa carinskim dokumentima)"
  - `izuzetoBezPrava` — "Oslobođeno bez prava na odbitak"
  - `izuzetoSaPravom` — "Oslobođeno sa pravom na odbitak"
- [ ] **Ticket P6-B.1.2:** When `pdvRezim` is any non-`redovan*` value, force `stopaPdv = 0` (field becomes read-only and disabled in UI) and require `pdvRezimOsnov: z.string().min(5)` — a free-text legal basis the user types (e.g. "čl. 24 st. 1 tačka 5 ZPDV"). DOCX renders the osnov beneath the stavka row.
- [ ] **Ticket P6-B.1.3:** Calculator rule (in `ied-shared`): `pdvObveznik === false` overrides everything (0% across the board). Otherwise, non-`redovan*` regime forces line PDV to 0 internally regardless of user input. `redovan20` + `redovan10` respect the user-set `stopaPdv`.
- [ ] **Ticket P6-B.1.4:** One-shot backfill script: every existing stavka in `racuni_v2` gets `pdvRezim: "redovan20"`. No `pdvRezimOsnov` for backfilled docs (not required for `redovan*`).

### Epic P6-C: Bilingual DOCX templates

- [ ] **Ticket P6-C.1.1:** Add `jezikDokumenta: z.enum(["sr", "sr-en"]).default("sr")` to `RacunV2Zod`.
- [ ] **Ticket P6-C.1.2:** Create bilingual templates: `predracunV2_bilingual.docx`, `avansniV2_bilingual.docx`, `konacniV2_bilingual.docx`, `racunV2_bilingual.docx`. Layout: stacked Serbian/English rows or side-by-side columns — design decision deferred to activation time. DOCX service picks the template by `(tipRacuna, jezikDokumenta)`.
- [ ] **Ticket P6-C.1.3:** Static label translation table in `ied-shared/src/i18n/racunLabels.ts` — one small JSON of `{ sr: "Naziv", en: "Item" }` pairs. No i18n framework. This is one document, not an app.

### Epic P6-D: Izdavac foreign-trade readiness

- [ ] **Ticket P6-D.1.1:** Populate `izdavac.imaInostraniPromet` per izdavac entry in `izdavacRacuna.const.ts`. The `valuta` Select's `EUR` option is disabled when the currently-selected izdavac has `imaInostraniPromet: false`.
- [ ] **Ticket P6-D.1.2:** Populate `izdavac.ibanEur` (IBAN + SWIFT/BIC) per entry where applicable. Renders on the DOCX only when `valuta !== "RSD"`, instead of the RSD `tekuciRacun`.
- [ ] **Ticket P6-D.1.3:** Snapshot-on-save logic extended: the existing save-time izdavac snapshot now also captures `imaInostraniPromet` and `ibanEur`. Same rule as everything else — historical invoices are stable against issuer-config changes.

### Epic P6-E: Known-unknowns to resolve before Phase 6 starts

These are questions I refuse to answer in advance of the business need; flagged so the next implementer is not surprised.

- Does IED actually have a EUR account today? If not, P6-D is partially blocked on operations.
- NBS fetch strategy: official web service vs daily-cached XML scrape vs manual entry only. Pick one at activation.
- Hybrid seminars (partly in-person Serbia, partly online): if the `pdvRezim` differs for the two halves, do we split into two stavke (supported today) or add a `mestoPrometa` enum per stavka that drives `pdvRezim` automatically? Strong preference: the former, keep it explicit.
- Invoice numbering: does the `SequenceModel` bucket for foreign invoices split from domestic, or stay unified? Default proposal: unified, matches V1.
- SEF/e-faktura is a separate phase entirely. Foreign invoices are always outside SEF; domestic B2B are inside it. Do not conflate.
- Rounding mode for RSD equivalents: accounting sign-off required before shipping — it affects PDV rekapitulacija by cents.

### Phase 6 definition of done

- User can set `valuta: "EUR"` on an invoice with a live NBS kurs snapshot.
- Per-stavka `pdvRezim` picker works, forces correct PDV treatment, renders legal basis text on DOCX.
- Bilingual DOCX downloads work for all four tipRacuna.
- Backfill has stamped `pdvRezim: "redovan20"` on every pre-Phase-6 stavka.
- One real foreign-client invoice has been issued end-to-end in staging and signed off by accounting.

---

## V1 vs V2 at a glance

| Aspect | V1 | V2 |
|--------|-----|----|
| Service/product per invoice | 1 embedded seminar | N via `stavke[]` discriminated on `tipStavke` (usluga, proizvod, future types) |
| Form state | Zustand + manual `updateNestedField` | react-hook-form + useFieldArray |
| Calculations | `useEffect` side-effect chain, duplicated FE+BE | pure functions in `ied-shared`, consumed by FE + BE |
| Stored `calculations` bucket | Yes (with popust inside, taxonomy mistake) | No — derived on read; snapshot only on issuance in Phase 5 |
| PDV rate | Single `stopaPdv` per invoice | Per-stavka `stopaPdv` (supports mixed rates); avansni keeps single rate as the exception |
| PDV obveznik handling | DOCX-render-time `shouldRenderPdvBlock` hack | `izdavac.pdvObveznik: boolean` snapshotted on the invoice; drives calculators + DOCX uniformly |
| Money type | JS `Number` + EPSILON rounding | Same in Phase 2 (match V1); `Decimal128` in Phase 5 |
| Validation | On submit only | Real-time via `zodResolver`, `mode: "onTouched"` |
| Layout | Single column, totals at bottom | Two-column with sticky summary |
| Route | `/racuni` | `/racuni-v2` |
| DB collection | `racuni` | `racuni_v2` (Phase 2), unified in Phase 5 |
| DB schema strategy | Mongoose `discriminator` per `tipRacuna` (4-way sub-schema duplication) | Single Mongoose model; `tipRacuna` preserved as required enum field; Zod discriminator at API boundary |
| `pozivNaBroj` | Auto pre-save hook (`SequenceModel`) | Phase 1: manual + required. Phase 2+: same auto-generator as V1 |
| `izdavac` data | Resolved from constants at DOCX-render time (leaky) | Snapshotted on the invoice at save time (incl. `pdvObveznik`) |
| Primalac modeling | Implicit firma, all fields optional, `firma_id` loose ref | `tipPrimaoca: "firma" \| "fizicko"` discriminator; required fields per branch |
| Konacni ↔ Avansni link | Single `linkedPozivNaBroj` string | Multi: `linkedAvansniIds: ObjectId[]` + `linkedPozivNaBrojevi: string[]`; primalac+izdavac match enforced |
| Stavka unit of measure | On seminar only (`jedinicaMere`) | Required on every stavka (`usluga` defaults `"Broj ucesnika"`, `proizvod` defaults `"Broj primeraka"`) |
| Invoice lifecycle | None; anything can be edited anytime | `status` field from day one; transitions + immutability in Phase 5 |
| Legal date fields | `datumUplateAvansa` only; `rokZaUplatu` as days, no frozen due date | `datumIzdavanja` always; `datumValute` frozen in Phase 5; `datumPrometa` deliberately deferred |
| Currency | Implicit RSD | Phase 1: inert `valuta` picker (RSD default, EUR scaffold-only, warning banner). Phase 2: `valuta: z.enum(["RSD","EUR"])` with API refine locking to RSD. Phase 6: EUR saves activate with NBS kurs snapshot, per-stavka `pdvRezim`, bilingual DOCX |
| Tab-switch behavior | Partial reset, confusing | Preserve only `izdavacRacuna` + `tekuciRacun` + `valuta`; reset everything else (including `defaultStopaPdv`) |
| Stavka cards | N/A | Always expanded in Phase 1; accordion in Phase 4 |
