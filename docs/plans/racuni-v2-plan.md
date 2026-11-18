# Računi V2 — plan

Replaces V1 `/racuni`. Collection `racuni_v2`, page `/racuni-v2`, flag `VITE_FF_RACUNI_V2`.
Flow: form → save → PDF → staff email it and upload it to SEF. The PDF is the
source of truth; the database finds and regenerates documents.
Open work only. Delete an item when it ships.

## Decided

- V1 gets deprecated. V2 has its own collection and UI.
- Types: predračun (standalone, may lead to a račun), avansni (standalone),
  konačni (links one avansni, deducts it), račun.
- Avansni amounts are typed without PDV; PDV is derived. Already built.
- Datum izdavanja: form field, default today, any date.
- Save stores totals computed on the backend.
- Editable and deletable until plaćeno/stornirano exist. Izdavač, tip and
  poziv na broj never change after create.
- One button: "Sačuvaj i preuzmi PDF". After saving, the list opens.
- Poziv na broj: one series per izdavač + tip + month, `YYMM` + 4 digits, as V1.
- No gaps in konačni and račun series (SEF).
- Everything goes to SEF. A document already in SEF is never deleted.
- V1 → V2 switch on the 1st of a month.
- Konačni searches for its avansni and deducts the amounts.
- EUR: for foreign companies, with its own PDV code. Later.
- No instalments: avans is paid separately, konačni pays the rest.
- Izdavači per deployment: one server IED + Permanent, the other BS.
- Model 97: optional.
- Edits are logged in `audit_log`.

## Proposed (confirm or change)

- **Next number** = highest number in the series + 1, assigned on save. No
  counter document, so a failed save leaves no gap. A unique index on
  `{izdavacRacuna, tipRacuna, pozivNaBroj}` makes a parallel save retry.
- **Series month = month of creation**, not datum izdavanja. Otherwise a
  document back-dated after the switch restarts a V1 month at 0001.
- **Poziv na broj on a new document:** empty = automatic; typed = used as is.
  A document made outside the app (EUR, konačni with two avansni) must be
  saved in V2 with its number, or V2 hands that number out again.
- **Konačni search** covers V2 and V1 avansni. Linking copies the avansni
  amounts into the konačni. An avansni linked to one konačni can't be linked
  to another.
- **List first.** `+ Novi` → pick type → form for that type. No type tabs, so
  nothing to reset. A saved document opens in the same form.
- **Izdavači per deployment:** BE env `IZDAVACI_RACUNA=ied,permanent` or
  `IZDAVACI_RACUNA=bs`; unset = all three. V2 lists and accepts only those.
  Izdavač data stays in `izdavacRacuna.const.ts`. V1 unchanged.
- **Model 97:** switch per izdavač. The PDF prints model 97 and two check
  digits before the number (`26110008` → `9626110008`). Later; no data change.
- **Storage:** primalac, stavke and totals are stored as sent; Zod validates them.
- **"Sačuvano"** shows as an `Alert` on the list. No new snackbar.
- Unchanged: the "Podrazumevana stopa PDV-a" field, `yyyy.MM.dd` dates.

| Document | Number |
|---|---|
| IED predračun, Nov 2026 | 26110001, 26110002, … |
| IED račun, Nov 2026 | 26110001 (series per tip) |
| BS račun, Nov 2026 | 26110001 (series per izdavač) |
| IED račun, Dec 2026 | 26120001 (new month) |
| IED račun 26110015 typed by hand | next automatic: 26110016 |
| Newest IED račun (26110016) deleted | next automatic: 26110016 again |

## Open questions

1. Accountant's rules: does any type keep counting across months (avansni)?
   Until then, every type restarts monthly.
2. EUR: which PDV exemption code(s), NBS rate on the PDF, English text, which
   izdavač has a EUR account. Needed when EUR starts.
3. V1 invoices after the switch: archive only, read-only list, or move into
   `racuni_v2`.
4. Delete confirmation: build the shared `ConfirmDialog` that `docs/ui.md`
   names as the likely direction? Recommended: yes.
5. Switch date: the 1st of which month?

## Owner actions

- Fix the account in `ied-be/src/constants/izdavacRacuna.const.ts`: IED and
  Permanent both list `205-0000000227245-69`.
- Add `IZDAVACI_RACUNA` to each server's `.env` when step 1 ships.

## Work, in order

1. **Izdavači per deployment.** Env var + `GET /api/racuni-v2/izdavaci`. V2
   form uses it: default = first, select hidden when only one. Save rejects
   other izdavači.
2. **Save.** `racunV2.model.ts`. Numbering in the service, tested: every table
   row, parallel saves. `POST /`, `PUT /:id`, `DELETE /:id`, `GET /:id`,
   `GET /:id/pdf`, audit middleware; remove `POST /generate`. FE: one button,
   datum izdavanja, optional poziv na broj; remove the two-step confirm and the
   developer texts ("Phase 1…"). `AGENTS.md`: drop "not persisted yet".
3. **List.** `GET /api/racuni-v2?q=&page=` (poziv na broj or primalac, newest
   first). List page with `+ Novi`, open, PDF, delete. Form without type tabs.
   Seminari "Kreiraj V2 račun" opens a new predračun. Ships with 2.
4. **Konačni and račun PDFs.** `konacni.hbs`, `racun.hbs`; avansni search
   (V2 + V1), deduction, block reuse.

Later: EUR · plaćeno/stornirano + lock · model 97 · NBS IPS QR code (the
placeholder sends payment data to `api.qrserver.com`) · remove V1.
