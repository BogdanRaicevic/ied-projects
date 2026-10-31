import type { SystemStyleObject, Theme } from "@mui/system";
import {
  type ColumnDef,
  columnFilteringFeature,
  columnPinningFeature,
  columnSizingFeature,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_equalsString,
  filterFn_includesString,
  globalFilteringFeature,
  type RowData,
  rowExpandingFeature,
  rowPaginationFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  sortFn_datetime,
  sortFn_text,
  tableFeatures,
} from "@tanstack/react-table";

type DataTableColumnMeta = {
  // Click on the cell copies its value.
  copy?: boolean;
  cellSx?: (value: unknown) => SystemStyleObject<Theme>;
  // Pick from these values instead of typing (use filterFn: "equalsString").
  filterOptions?: { value: string; label: string }[];
};

export const features = tableFeatures({
  columnFilteringFeature,
  globalFilteringFeature,
  columnPinningFeature,
  columnSizingFeature,
  rowExpandingFeature,
  rowPaginationFeature,
  rowSortingFeature,
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  // "auto" sorting only picks from registered fns
  sortFns: {
    alphanumeric: sortFn_alphanumeric,
    basic: sortFn_basic,
    datetime: sortFn_datetime,
    text: sortFn_text,
  },
  filterFns: {
    equalsString: filterFn_equalsString,
    includesString: filterFn_includesString,
  },
  columnMeta: {} as DataTableColumnMeta,
});

export type DataTableFeatures = typeof features;

export type DataTableColumn<T extends RowData> = ColumnDef<
  DataTableFeatures,
  T
>;
