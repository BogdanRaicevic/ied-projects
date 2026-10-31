import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import PushPinIcon from "@mui/icons-material/PushPin";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  ButtonBase,
  IconButton,
  InputAdornment,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  TextField,
  type TextFieldProps,
  Tooltip,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import type { SystemStyleObject, Theme } from "@mui/system";
import {
  type Column,
  type ColumnDef,
  columnFilteringFeature,
  columnPinningFeature,
  columnSizingFeature,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  FlexRender,
  filterFn_equalsString,
  filterFn_includesString,
  functionalUpdate,
  globalFilteringFeature,
  type PaginationState,
  type RowData,
  rowExpandingFeature,
  rowPaginationFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_datetime,
  sortFn_text,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import { Fragment, type ReactNode, useEffect, useRef, useState } from "react";

type DataTableColumnMeta = {
  // Click on the cell copies its value.
  copy?: boolean;
  cellSx?: (value: unknown) => SystemStyleObject<Theme>;
  // With filters on: pick from these values instead of typing (use filterFn: "equalsString").
  filterOptions?: { value: string; label: string }[];
};

const features = tableFeatures({
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
    datetime: sortFn_datetime,
    text: sortFn_text,
  },
  filterFns: {
    equalsString: filterFn_equalsString,
    includesString: filterFn_includesString,
  },
  columnMeta: {} as DataTableColumnMeta,
});

export type DataTableColumn<T extends RowData> = ColumnDef<typeof features, T>;

type DataTableProps<T extends RowData> = {
  columns: DataTableColumn<T>[];
  data: T[];
  isLoading?: boolean;
  // Paging: pass pagination + onPaginationChange. With rowCount the server
  // pages the data; without it the table pages `data` itself.
  pagination?: PaginationState;
  onPaginationChange?: (pagination: PaginationState) => void;
  rowCount?: number;
  // Adds an expand button to each row; the panel renders in a full-width row below.
  renderDetailPanel?: (row: T) => ReactNode;
  // Column ids that stick to the left while scrolling. They must be the first
  // columns, and don't combine with renderDetailPanel (its button column is unaccounted for).
  pinnedLeft?: string[];
  getRowColor?: (row: T) => string | undefined;
};

export default function DataTable<T extends RowData>({
  columns,
  data,
  isLoading,
  pagination,
  onPaginationChange,
  rowCount,
  renderDetailPanel,
  pinnedLeft,
  getRowColor,
}: DataTableProps<T>) {
  const table = useTable({
    features,
    columns,
    data,
    state: pagination && { pagination },
    // Lets the table jump back to page 1 when filters change (client paging only).
    onPaginationChange: (updater) =>
      pagination && onPaginationChange?.(functionalUpdate(updater, pagination)),
    manualPagination: rowCount !== undefined,
    rowCount,
    getRowCanExpand: () => !!renderDetailPanel,
    initialState: { columnPinning: { start: pinnedLeft ?? [], end: [] } },
    defaultColumn: { filterFn: "includesString" },
    globalFilterFn: "includesString",
  });
  // Column filters are hidden until opened; closing one also clears it, so a
  // hidden filter never silently hides rows.
  const [openFilters, setOpenFilters] = useState<string[]>([]);
  const toggleFilter = (column: Column<typeof features, T>) => {
    if (openFilters.includes(column.id)) {
      column.setFilterValue(undefined);
      setOpenFilters((ids) => ids.filter((id) => id !== column.id));
    } else {
      setOpenFilters((ids) => [...ids, column.id]);
    }
  };
  const rows = table.getRowModel().rows;
  const columnCount = columns.length + (renderDetailPanel ? 1 : 0);

  // A column with `size` is exactly that wide (pinned ones always are, so their
  // sticky offsets match the layout). Other columns grow with their content.
  const fixedWidth = (column: Column<typeof features, T>) =>
    column.getIsPinned() ? column.getSize() : column.columnDef.size;
  const widthSx = (column: Column<typeof features, T>) => {
    const width = fixedWidth(column);
    return width
      ? { width, minWidth: width }
      : { minWidth: column.columnDef.minSize };
  };
  // Content max width: fixed columns subtract the 16px + 16px cell padding.
  const contentWidth = (column: Column<typeof features, T>) => {
    const width = fixedWidth(column);
    return width ? width - 32 : 500;
  };
  const pinnedSx = (
    column: Column<typeof features, T>,
  ): SystemStyleObject<Theme> =>
    column.getIsPinned()
      ? {
          position: "sticky",
          left: column.getStart("start"),
          zIndex: 1,
          bgcolor: "inherit",
          // Light tint on top of the row colour, so pinned columns stand out.
          backgroundImage: (theme) => {
            const tint = alpha(theme.palette.primary.main, 0.06);
            return `linear-gradient(${tint}, ${tint})`;
          },
        }
      : {};

  return (
    <Paper>
      {/* Search + column filters only filter the rows the table has (with server paging: the current page). */}
      <Box sx={{ p: 1 }}>
        <DebouncedTextField
          size="small"
          placeholder="Pretraži tabelu…"
          onDebouncedChange={(value) => table.setGlobalFilter(value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            },
            htmlInput: { "aria-label": "Pretraži tabelu" },
          }}
        />
      </Box>
      {isLoading && <LinearProgress />}
      <TableContainer>
        {/* separate borders: with collapse, sticky cells leave see-through seams */}
        <Table size="small" sx={{ borderCollapse: "separate" }}>
          <TableHead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                sx={{ bgcolor: "background.paper" }}
              >
                {renderDetailPanel && <TableCell padding="checkbox" />}
                {headerGroup.headers.map((header) => (
                  <TableCell
                    key={header.id}
                    sx={{
                      fontWeight: 700,
                      ...widthSx(header.column),
                      ...pinnedSx(header.column),
                    }}
                  >
                    <Box sx={{ maxWidth: contentWidth(header.column) }}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                      >
                        {header.column.getIsPinned() && (
                          <PushPinIcon
                            color="primary"
                            sx={{ fontSize: 14, opacity: 0.7 }}
                            titleAccess="Zakačena kolona"
                          />
                        )}
                        {header.isPlaceholder ? null : header.column.getCanSort() ? (
                          <TableSortLabel
                            active={!!header.column.getIsSorted()}
                            direction={header.column.getIsSorted() || "asc"}
                            onClick={header.column.getToggleSortingHandler()}
                            // MUI hides the icon until hover; keep it visible (sorted column is full opacity)
                            sx={{
                              "& .MuiTableSortLabel-icon": { opacity: 0.4 },
                            }}
                          >
                            <FlexRender header={header} />
                          </TableSortLabel>
                        ) : (
                          <FlexRender header={header} />
                        )}
                        {header.column.getCanFilter() && (
                          <IconButton
                            size="small"
                            sx={{ p: 0.25 }}
                            color={
                              openFilters.includes(header.column.id)
                                ? "primary"
                                : "default"
                            }
                            aria-label={
                              openFilters.includes(header.column.id)
                                ? "Sakrij filter"
                                : "Prikaži filter"
                            }
                            onClick={() => toggleFilter(header.column)}
                          >
                            <SearchIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        )}
                      </Box>
                      {header.column.getCanFilter() &&
                        openFilters.includes(header.column.id) && (
                          <ColumnFilter column={header.column} />
                        )}
                    </Box>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <Fragment key={row.id}>
                <TableRow
                  sx={{
                    bgcolor: getRowColor?.(row.original) ?? "background.paper",
                    "&:hover": getRowColor?.(row.original)
                      ? {}
                      : { bgcolor: "grey.100" },
                  }}
                >
                  {renderDetailPanel && (
                    <TableCell padding="checkbox">
                      <IconButton
                        size="small"
                        aria-label={
                          row.getIsExpanded()
                            ? "Sakrij detalje"
                            : "Prikaži detalje"
                        }
                        onClick={() => row.toggleExpanded()}
                      >
                        {row.getIsExpanded() ? (
                          <KeyboardArrowUpIcon />
                        ) : (
                          <KeyboardArrowDownIcon />
                        )}
                      </IconButton>
                    </TableCell>
                  )}
                  {row.getAllCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      sx={{
                        ...widthSx(cell.column),
                        ...pinnedSx(cell.column),
                        ...cell.column.columnDef.meta?.cellSx?.(
                          cell.getValue(),
                        ),
                      }}
                    >
                      {/* max-width on a <td> is ignored by browsers, so wrap the content */}
                      <Box
                        sx={{
                          maxWidth: contentWidth(cell.column),
                          overflowWrap: "anywhere",
                        }}
                      >
                        {cell.column.columnDef.meta?.copy ? (
                          <CopyOnClick value={String(cell.getValue() ?? "")}>
                            <FlexRender cell={cell} />
                          </CopyOnClick>
                        ) : (
                          <FlexRender cell={cell} />
                        )}
                      </Box>
                    </TableCell>
                  ))}
                </TableRow>
                {row.getIsExpanded() && renderDetailPanel && (
                  <TableRow>
                    <TableCell colSpan={columnCount}>
                      {renderDetailPanel(row.original)}
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            ))}
            {rows.length === 0 && !isLoading && (
              <TableRow>
                <TableCell colSpan={columnCount} align="center">
                  Nema podataka
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {pagination && onPaginationChange && (
        <TablePagination
          component="div"
          count={rowCount ?? data.length}
          page={pagination.pageIndex}
          rowsPerPage={pagination.pageSize}
          rowsPerPageOptions={[5, 10, 20, 25, 50, 100]}
          onPageChange={(_, pageIndex) =>
            onPaginationChange({ ...pagination, pageIndex })
          }
          onRowsPerPageChange={(e) =>
            onPaginationChange({ pageIndex: 0, pageSize: +e.target.value })
          }
          labelRowsPerPage="Redova po strani:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}–${to} od ${count}`
          }
        />
      )}
    </Paper>
  );
}

function CopyOnClick({
  value,
  children,
}: {
  value: string;
  children: ReactNode;
}) {
  const [title, setTitle] = useState("Kopiraj");
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setTitle("Kopirano");
    } catch {
      setTitle("Kopiranje nije uspelo");
    }
  };

  return (
    <Tooltip title={title} onClose={() => setTitle("Kopiraj")}>
      <ButtonBase onClick={copy} sx={{ font: "inherit", textAlign: "left" }}>
        {children}
        <ContentCopyIcon sx={{ fontSize: 14, ml: 0.5, opacity: 0.5 }} />
      </ButtonBase>
    </Tooltip>
  );
}

function ColumnFilter<T extends RowData>({
  column,
}: {
  column: Column<typeof features, T>;
}) {
  const options = column.columnDef.meta?.filterOptions;
  const header = column.columnDef.header;
  const label = `Filter: ${typeof header === "string" ? header : column.id}`;

  if (options) {
    return (
      <Select
        autoFocus
        displayEmpty
        fullWidth
        size="small"
        variant="standard"
        value={(column.getFilterValue() as string | undefined) ?? ""}
        onChange={(e) => column.setFilterValue(e.target.value || undefined)}
        inputProps={{ "aria-label": label }}
      >
        <MenuItem value="">Svi</MenuItem>
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    );
  }

  return (
    <DebouncedTextField
      autoFocus
      fullWidth
      size="small"
      variant="standard"
      placeholder="Filter…"
      onDebouncedChange={(value) => column.setFilterValue(value || undefined)}
      slotProps={{ htmlInput: { "aria-label": label } }}
    />
  );
}

// Uncontrolled input that reports its value once typing pauses, so the table
// doesn't re-filter on every keystroke.
function DebouncedTextField({
  onDebouncedChange,
  ...props
}: TextFieldProps & { onDebouncedChange: (value: string) => void }) {
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  // A pending update must not fire after unmount (closing a column filter clears it).
  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <TextField
      {...props}
      onChange={(e) => {
        const value = e.target.value;
        clearTimeout(timer.current);
        timer.current = setTimeout(() => onDebouncedChange(value), 300);
      }}
    />
  );
}
