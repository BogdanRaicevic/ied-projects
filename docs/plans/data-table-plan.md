# DataTable — replace material-react-table

Replace `material-react-table` (MRT) with one shared `DataTable` built on
`@tanstack/react-table` + MUI `Table`. Goal: unblock MUI 9 (MRT 3.2.1 passes
props MUI 9 removed) and own a smaller table.

Status: **draft — awaiting review**.

## Rules for this work

- **Each feature lands together with the first table that uses it.** No
  commit adds code nobody calls yet.
- Each commit: app works, `pnpm typecheck && pnpm lint:error` pass, the
  touched screens are checked by hand.
- Each migrated table drops its `scrollbarProps` (top scrollbar is dropped).

## Scope

**Keep:** custom cells/headers/widths, pagination (server and client), loading
bar, row colour, row actions column, detail panel, sticky left columns via a
`pinnedLeft` prop, click to copy via column `meta: { copy: true }`, quick
filters on Računi.

**Drop:** top scrollbar, global search, density, fullscreen, inline editing,
filter modes, column actions menu.

**Deferred (decide after migration, only if missed):** column hiding UI, pin
from header UI, drag to reorder, remembering column state across reloads.

**Open questions**

1. OK to add `@tanstack/react-table` as a direct dependency? (Already installed
   through MRT.)
2. OK to put it in `ied-fe/src/components/DataTable/DataTable.tsx`?
3. MRT lets users sort by clicking any header today (on the current page only).
   Keep sorting everywhere, only on Računi (where it's explicitly on), or drop?

## Commits

### 1. `feat(fe): add DataTable, use it in FirmaSeminarSubTable`
- Add `@tanstack/react-table` to `ied-fe`.
- `DataTable<T>({ columns, data })`: header + body, column `size` → width.
- Migrate `FirmaSeminarSubTable` (no pagination, no toolbars — simplest).
- **Review:** firma-seminar detail shows the same sub-table.

### 2. `feat(fe): DataTable pagination and loading, migrate AuditLog`
- Props `pagination`, `onPaginationChange`, `rowCount`, `isLoading`.
  `TablePagination` with Serbian labels, `LinearProgress` while loading.
- Migrate `pages/AuditLog.tsx`.
- **Review:** paging through the audit log, loading bar on page change.

### 3. `feat(fe): DataTable detail panel, migrate Seminari tables`
- Prop `renderDetailPanel(row)` → expand button + full-width row below.
- Migrate `SeminariTable` and `FirmaSeminarTable`.
- `SeminarSubTable` takes TanStack `Row` instead of `MRT_Row`.
- **Review:** expanding a seminar and a firma-seminar row.

### 4. `feat(fe): DataTable sticky columns, row colour, copy; migrate FirmasTable`
- Prop `pinnedLeft: string[]` → sticky columns via TanStack column pinning.
- Prop `getRowSx(row)` → row `sx` (red for `prijavljeni === false`).
- Column `meta: { copy: true }` → click copies text, "Kopirano" tooltip.
- Migrate `FirmasTable` + `firmaColumns` (pinned `rowNumber`, `naziv_firme`;
  copy on `e_mail`).
- **Review:** horizontal scroll keeps pinned columns, red rows, copying an email.

### 5. `refactor(fe): migrate ZaposleniTable to DataTable`
- Client-side pagination, 50 per page (no new props: no `rowCount` → client mode).
- Row actions become a normal `actions` column; pinned `rowNumber`, `actions`.
- `Firma.tsx` handlers take TanStack `Row` instead of `MRT_Row`.
- **Review:** employees list on a firma page — edit, delete, prijavi na seminar.

### 6. `feat(fe): quick filters on Računi, migrate PretrageRacuna`
- Toggle buttons above the table: izdavač (`ied`, `bs`, `permanent`) and tip
  računa (`predracun`, `avansniRacun`, `konacniRacun`, `racun`). Replace the
  header dropdowns.
- Keep the seminar text filter and sorting.
- Filters apply to the current page only — same as today.
- **Review:** each filter, sorting, paging.

### 7. `chore(fe): remove material-react-table`
- Delete `hooks/useTopScrollbar.tsx`, remove `material-react-table` from
  `package.json`, `pnpm fallow dead-code` clean.
- `docs/ui.md`: Tables row → `DataTable`; drop the MRT "Table defaults" item.
- **Review:** build passes on MUI 9 with no MRT left.
