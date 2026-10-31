# DataTable — review & cleanup plan

Critical review of the last 17 commits (MUI 9 fixes + MRT → DataTable).
Status: **draft — awaiting review**. One step = one staged change to review.

## Findings

### Bugs (introduced by the migration)

1. **Sub-table silently shows max 10 rows.** `FirmaSeminarSubTable` passes no
   pagination, but since commit `ede58149` DataTable does client paging
   whenever `rowCount` is missing → TanStack's default `pageSize` 10, and no
   pager is rendered. A firma with 11+ seminars loses rows in the detail panel.
   --> the subpanel should show everying, no pagination there
2. **Firme "Mesto" can't be sorted, filtered or searched.** `accessorKey:
   "mesto"` is an object; the cell renders `naziv_mesto`, but sort/filter/search
   see `[object Object]`.
   --> NOTE for me to resolve

### Duplication

3. **Row-number column copied 6 times** (AuditLog, Seminari, FirmaSeminar,
   FirmaSeminarSub, Firme, Zaposleni) with two different formulas (server vs
   client paging).
   --> Row number is just the numbering the rows in a table, if you have a better solution, please propose it, but the users should see a number of row.
4. Tip računa / izdavač labels live in 3 places (PretrageRacuna cells, its
   `filterOptions`, `ParametriPretrageRacuna` chips). Pre-existing, made worse
   by the filter dropdowns.
   --> unifiy it somehwhere in the project

### Structure

5. **`DataTable.tsx` is 467 lines with 4 components + config + style helpers.**
6. Column definitions follow 3 patterns: module scope (Firme, FirmaSeminar,
   Računi), `useMemo(..., [])` inline (AuditLog), built in render + `useMemo([])`
   (Seminari, Biome warning). Only Seminari and Zaposleni need the component
   scope (handlers).

### Noise, no action

- `biome format --write src` in the MUI fix commits reformatted 4 unrelated
  files (`RacunV2Content`, `primalac.ts`, `certificate.ts`,
  `PrimalacRacunaSection`). Formatting only; leave it.
- Row numbers follow data order, so they shuffle after sorting (same as MRT). --> this is ok

## Proposed file split (step 4)

```
components/DataTable/
  DataTable.tsx          useTable + layout: search box, head row, body rows,
                         detail row, empty row, pagination        (~170 lines)
  features.ts            tableFeatures, DataTableColumn, column meta type
  columnSx.ts            widthSx / contentWidth / pinnedSx (pure, take a column)
  HeaderCell.tsx         pin icon, sort label, filter toggle; owns its own
                         "filter open" state (drops openFilters from DataTable)
  ColumnFilter.tsx       text or dropdown filter
  DebouncedTextField.tsx
  CopyOnClick.tsx
  rowNumberColumn.ts     shared R. BR. column (step 3)
```

Not splitting further: body row / detail row / pagination stay in
`DataTable.tsx` — extracting them means threading 4–5 props each for ~20 lines.
No `index.ts` barrel (callers import `DataTable/DataTable` today).

## Steps (one staged change each)

1. `fix(fe): DataTable sub-tables show all rows` — no `pagination` prop → no
   paging (`manualPagination: !pagination || rowCount !== undefined`).
2. `fix(fe): sort/filter Firme by mesto name` — `accessorFn: (f) =>
   f.mesto?.naziv_mesto ?? ""`, cell renders the value.
3. `refactor(fe): shared row-number column` — `rowNumberColumn<T>()` counts
   `row.index + 1`, plus the page offset only for server paging; replaces the 6
   copies.
4. `refactor(fe): split DataTable into files` — per the tree above. No
   behaviour change.
5. `refactor(fe): consistent column definitions` — module scope where no
   closure (AuditLog); Seminari builds columns in one `useMemo` with real deps
   (clears the Biome warning).
6. *(optional)* `refactor: one tip/izdavač label map` — e.g. `TIP_RACUNA_LABELS`
   next to `IZDAVAC_RACUNA_LABELS` in `ied-shared`, used by cells, filter
   options and `ParametriPretrageRacuna`.
7. Mark `data-table-plan.md` done (or delete both plans once merged).

## Open questions

1. Steps 1–2 are bugs — do them first, before the split?
2. Step 6: worth it now, or tech-debt?
3. Keep finished plans in `docs/plans/`, or delete them after merge?
