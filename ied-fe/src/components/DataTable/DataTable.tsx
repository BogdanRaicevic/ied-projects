import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import {
  Box,
  IconButton,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
} from "@mui/material";
import {
  type ColumnDef,
  columnSizingFeature,
  createSortedRowModel,
  FlexRender,
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
import { Fragment, type ReactNode } from "react";

const features = tableFeatures({
  columnSizingFeature,
  rowExpandingFeature,
  rowPaginationFeature,
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  // "auto" sorting only picks from registered fns
  sortFns: {
    alphanumeric: sortFn_alphanumeric,
    datetime: sortFn_datetime,
    text: sortFn_text,
  },
});

export type DataTableColumn<T extends RowData> = ColumnDef<typeof features, T>;

type DataTableProps<T extends RowData> = {
  columns: DataTableColumn<T>[];
  data: T[];
  isLoading?: boolean;
  // Server-side pagination: pass all three, or none for a table without paging.
  pagination?: PaginationState;
  onPaginationChange?: (pagination: PaginationState) => void;
  rowCount?: number;
  // Adds an expand button to each row; the panel renders in a full-width row below.
  renderDetailPanel?: (row: T) => ReactNode;
};

export default function DataTable<T extends RowData>({
  columns,
  data,
  isLoading,
  pagination,
  onPaginationChange,
  rowCount,
  renderDetailPanel,
}: DataTableProps<T>) {
  const table = useTable({
    features,
    columns,
    data,
    state: pagination && { pagination },
    manualPagination: true,
    rowCount,
    getRowCanExpand: () => !!renderDetailPanel,
  });
  const rows = table.getRowModel().rows;
  const columnCount = columns.length + (renderDetailPanel ? 1 : 0);

  return (
    <Paper>
      {isLoading && <LinearProgress />}
      <TableContainer>
        <Table size="small">
          <TableHead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {renderDetailPanel && <TableCell padding="checkbox" />}
                {headerGroup.headers.map((header) => (
                  <TableCell
                    key={header.id}
                    sx={{
                      fontWeight: 700,
                      width: header.column.columnDef.size,
                      minWidth: header.column.columnDef.minSize,
                    }}
                  >
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <TableSortLabel
                        active={!!header.column.getIsSorted()}
                        direction={header.column.getIsSorted() || "asc"}
                        onClick={header.column.getToggleSortingHandler()}
                        // MUI hides the icon until hover; keep it visible (sorted column is full opacity)
                        sx={{ "& .MuiTableSortLabel-icon": { opacity: 0.4 } }}
                      >
                        <FlexRender header={header} />
                      </TableSortLabel>
                    ) : (
                      <FlexRender header={header} />
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <Fragment key={row.id}>
                <TableRow hover>
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
                    <TableCell key={cell.id}>
                      {/* max-width on a <td> is ignored by browsers, so wrap the content */}
                      <Box sx={{ maxWidth: 500, overflowWrap: "anywhere" }}>
                        <FlexRender cell={cell} />
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
          count={rowCount ?? 0}
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
