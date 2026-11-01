# DataTable — review & cleanup plan

Critical review of the last 17 commits (MUI 9 fixes + MRT → DataTable).
Status: **done**.

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

## Outcome

1. Done — no `pagination` prop → every row shows, no pager.
2. Done — Mesto column value is `mesto?.naziv_mesto` (`accessorFn`), so
   sort/filter/search see the name; default cell renders it.
3. Done, differently — `DataTable` adds R. BR. to every table itself
   (position on screen + page offset); the 6 copies are gone.
4. Done — `DataTable/` split into DataTable, HeaderCell, ColumnFilter,
   DebouncedTextField, CopyOnClick, columnSx, features. The R. BR. column
   stayed in `DataTable.tsx` (its only user).
5. Done, stricter — rule in `docs/ui.md`: columns live in
   `<name>Columns.tsx`; `get<Name>Columns(handlers)` only when cells need the
   table's handlers (Zaposleni, Seminari). Also typed
   `SeminariTableActionCell` props as the full `SeminarZodType`.
6. Done — `TIP_RACUNA_LABELS` in `ied-shared`; colours + `TipRacunaChip` /
   `IzdavacRacunaChip` in `Racun/RacunChips.tsx`. Labels unified to the full
   names ("Konačni račun", "Avansni račun").
7. Done — both plans marked done and kept in `docs/plans/`.
