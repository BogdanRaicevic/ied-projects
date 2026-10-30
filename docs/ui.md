# UI conventions (`ied-fe`)

Users are Serbian-speaking office staff working with large tables of
companies all day. Favour dense, predictable screens over pretty ones.

## Follow these

| Topic | Convention | Example |
|---|---|---|
| Components | MUI only; style with `sx` | everywhere |
| Tables | `material-react-table` (`useMaterialReactTable`) | `Seminari/SeminariTable.tsx` |
| Forms | RHF + zodResolver; multi-section forms like RacunV2 | `RacunV2/` |
| Dialogs | MUI `Dialog`, one component per dialog in `components/Dialogs/` | `Dialogs/PretragaSaveDialog.tsx` |
| Error / info inside a screen | MUI `<Alert severity=…>` near what failed | `FirmaForm.tsx` |
| Loading | `CircularProgress` (or `Skeleton` for lists) while a query is pending; disable the submit button while a mutation is pending | `pages/Firma.tsx`, `pages/Seminari.tsx` |
| Labels & messages | Serbian, **with** diacritics (`želite`, `obrišete`), sentence case | |
| Dates shown to users | `dd.MM.yyyy` via `date-fns` `format` | `KontaktKomentarDialog.tsx` |
| Money | `formatMoney` from `ied-shared` | `RacunV2/SummaryPanel.tsx` |

Every screen that loads data needs all three states: loading, error
(`Alert`), and empty.

## Not decided yet — ask before choosing

These are inconsistent today. Don't invent a new approach and don't spread
one of the existing ones; ask.

- **Delete confirmation** — currently `window.confirm(...)` in 5 places.
  Likely direction: one shared `ConfirmDialog`.
- **Success feedback** ("Sačuvano") — ad-hoc `Snackbar` + local state in
  `SeminarForm.tsx` and `pages/Racuni.tsx`, nothing elsewhere. Likely
  direction: one app-wide snackbar.
- **Theme** — none (`createTheme` is never used); colours are hardcoded in
  places (e.g. `ApplicationNavBar.tsx`).
- **Table defaults** — each table sets its own `enable*` options and there's
  no Serbian localization for material-react-table.

When one of these is decided, move it to the table above.
