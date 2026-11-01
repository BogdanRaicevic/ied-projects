# DataTable — replace material-react-table

Replace `material-react-table` (MRT) with one shared `DataTable` built on
`@tanstack/react-table` + MUI `Table`. Goal: unblock MUI 9 (MRT 3.2.1 passes
props MUI 9 removed) and own a smaller table.

Status: **done** — merged on the MUI 9 branch; follow-up review in `data-table-cleanup-plan.md`.

## Rules for this work

- **Each feature lands together with the first table that uses it.** No
  commit adds code nobody calls yet.
- Each commit: app works, `pnpm typecheck && pnpm lint:error` pass, the
  touched screens are checked by hand.
- Each migrated table drops its `scrollbarProps` (top scrollbar is dropped).

## Scope

**Keep:** custom cells/headers/widths, pagination (server and client), loading
bar, row colour, row actions column, detail panel, sticky left columns via a
`pinnedLeft` prop, click to copy via column `meta: { copy: true }`, sorting,
filters on every table: search box above the table + a per-column filter
opened with the header search icon.

**Drop:** top scrollbar, density, fullscreen, inline editing,
filter modes, column actions menu.

**Deferred (decide after migration, only if missed):** column hiding UI, pin
from header UI, drag to reorder, remembering column state across reloads.

**Decided**

- `@tanstack/react-table` v9 is a direct `ied-fe` dependency.
- `DataTable` lives in `ied-fe/src/components/DataTable/DataTable.tsx`.
- Sorting by header click stays on every column that has a value (client-side,
  current page only — same as MRT). Added in commit 3.

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

### 6. `refactor(fe): migrate PretrageRacuna to DataTable`
- `DataTable` filters (every table): search box above the table + a per-column
  filter, hidden until the header search icon opens it (closing clears it);
  columns with `meta.filterOptions` get a single-value dropdown ("Svi" +
  values) instead of text. Filters only the current page — the search form
  above still filters server-side across all results.
- Računi: dropdowns for tip računa and izdavač (`IZDAVAC_RACUNA_LABELS`).
- Poziv-na-broj cell becomes a component (it called `useNavigate` inside a
  cell function).
- **Review:** table search, column filters, form search, paging, sorting,
  poziv-na-broj link and copy.

### 7. `chore(fe): remove material-react-table`
- Delete `hooks/useTopScrollbar.tsx`, remove `material-react-table` from
  `package.json`, `pnpm fallow dead-code` clean.
- `docs/ui.md`: Tables row → `DataTable`; drop the MRT "Table defaults" item.
- **Review:** build passes on MUI 9 with no MRT left.

## After the migration

- `useEffect` missing-deps audit moved to `docs/tech-debt.md` (P1).
