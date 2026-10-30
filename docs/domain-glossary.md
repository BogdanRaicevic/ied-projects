# Domain glossary

Identifiers in code stay in Serbian. This maps them to meaning.

## Entities

| Term (code) | Meaning | Where |
|---|---|---|
| `firma` / `firme` | Company (client or prospect) | `firma.model.ts`, `/firma` |
| `zaposleni` | Employee of a firma (embedded in firma) | `zaposleni.model.ts`, `Zaposleni/` |
| `seminar` / `seminari` | Seminar (training event), has one or more `datumi` | `seminar.model.ts`, `/seminari` |
| `prijava` / `prijave` | Registration of a zaposleni (or firma) for a seminar | embedded in seminar |
| `tip_seminara` | Seminar type/category | |
| `pretraga` / `pretrage` | Saved search (a named set of firma filters) | `pretrage.model.ts`, `/pretrage` |
| `mesto` / `mesta` | City / place | |
| `delatnost` / `delatnosti` | Industry / business activity | |
| `tip_firme` | Company type | |
| `velicina_firme` | Company size category | |
| `stanje_firme` | Company status (active, closed, …) | |
| `radno_mesto` / `radna_mesta` | Job position of a zaposleni | |
| `odjava` | Unsubscribe (from mailing) | |
| `email_suppression` | Emails that must not be contacted | |
| `last_contacted` | When/how a firma was last contacted | |
| `audit_log` | Change history of firma/seminar documents | `middleware/audit.ts` |
| `sertifikat` | Attendance certificate (PDF, per brand) | `templates/certificates/` |
| `PIB` | Tax ID number | |
| `matični broj` (`maticniBroj`) | Company registration number | |

## Invoices (računi)

| Term | Meaning |
|---|---|
| `racun` / `racuni` | Invoice |
| `predracun` | Proforma invoice (quote, before payment) |
| `avansni racun` | Advance-payment invoice |
| `konacni racun` | Final invoice (after avans, deducts it) |
| `racun` (type) | Regular invoice |
| `izdavac racuna` | Issuer — one of the brands below |
| `primalac racuna` | Recipient (the firma) |
| `stavka` / `stavke` | Line item; `usluga` = service, `proizvod` = product |
| `PDV` / `PDV obveznik` | VAT / VAT-registered (Permanent is **not**) |
| `tekuci racun` | Bank account number |
| `rekapitulacija` | Totals summary |

## Brands (izdavači)

The same app serves several related organisations. Each has its own invoice
data and certificate template.

| id | Name |
|---|---|
| `ied` | Institut za Ekonomsku Diplomatiju |
| `permanent` (`perm`) | Permanent Educom — not a PDV obveznik |
| `bs` | Balkanski savet za održivi razvoj i edukaciju |

Source of truth: `ied-be/src/constants/izdavacRacuna.const.ts` and
`ied-shared/src/constants/racuni.ts`.
