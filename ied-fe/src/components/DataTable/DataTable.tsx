import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  IconButton,
  InputAdornment,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
} from "@mui/material";
import {
  FlexRender,
  functionalUpdate,
  type PaginationState,
  type RowData,
  useTable,
} from "@tanstack/react-table";
import { Fragment, type ReactNode, useMemo } from "react";
import CopyOnClick from "./CopyOnClick";
import { contentWidth, pinnedSx, widthSx } from "./columnSx";
import DebouncedTextField from "./DebouncedTextField";
import { type DataTableColumn, features } from "./features";
import HeaderCell from "./HeaderCell";

export type { DataTableColumn } from "./features";

// Every table gets an "R. BR." column: position on screen + page offset, so it
// stays 1, 2, 3… after sorting/filtering. Pin it with pinnedLeft "rowNumber".
const rowNumberColumn = <T extends RowData>(): DataTableColumn<T> => ({
  id: "rowNumber",
  header: "R. BR.",
  size: 90,
  cell: ({ row, table }) => {
    const { pageIndex, pageSize } = table.atoms.pagination.get();
    // Display index counts the sorted/filtered rows before paging; server pages
    // only hold the current page, so add the page offset there.
    const offset = table.options.manualPagination ? pageIndex * pageSize : 0;
    return offset + row.getDisplayIndex() + 1;
  },
});

// No paging, or pagination + onPaginationChange together. With rowCount the
// server pages the data; without it the table pages `data` itself.
type DataTablePaging =
  | { pagination?: never; onPaginationChange?: never; rowCount?: never }
  | {
      pagination: PaginationState;
      onPaginationChange: (pagination: PaginationState) => void;
      rowCount?: number;
    };

type DataTableProps<T extends RowData> = DataTablePaging & {
  columns: DataTableColumn<T>[];
  data: T[];
  isLoading?: boolean;
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
  const allColumns = useMemo(
    () => [rowNumberColumn<T>(), ...columns],
    [columns],
  );
  const table = useTable({
    features,
    columns: allColumns,
    data,
    state: pagination && { pagination },
    // Lets the table jump back to page 1 when filters change (client paging only).
    onPaginationChange: (updater) =>
      pagination && onPaginationChange?.(functionalUpdate(updater, pagination)),
    // No pagination prop → show every row; with rowCount the server pages.
    manualPagination: !pagination || rowCount !== undefined,
    rowCount,
    getRowCanExpand: () => !!renderDetailPanel,
    initialState: { columnPinning: { start: pinnedLeft ?? [], end: [] } },
    defaultColumn: { filterFn: "includesString" },
    globalFilterFn: "includesString",
  });
  const rows = table.getRowModel().rows;
  const columnCount = allColumns.length + (renderDetailPanel ? 1 : 0);
  // With server paging the table only holds the current page, so say so.
  const searchLabel =
    rowCount === undefined ? "Pretraži tabelu" : "Pretraži ovu stranu";

  return (
    <Paper>
      {/* Search + column filters only filter the rows the table has (with server paging: the current page). */}
      <Box sx={{ p: 1 }}>
        <DebouncedTextField
          size="small"
          placeholder={`${searchLabel}…`}
          onDebouncedChange={(value) => table.setGlobalFilter(value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            },
            htmlInput: { "aria-label": searchLabel },
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
                  <HeaderCell key={header.id} header={header} />
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
                        aria-expanded={row.getIsExpanded()}
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
          count={table.getRowCount()}
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
