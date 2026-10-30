import {
  Box,
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
  type ColumnDef,
  columnSizingFeature,
  FlexRender,
  type PaginationState,
  type RowData,
  rowPaginationFeature,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";

const features = tableFeatures({ columnSizingFeature, rowPaginationFeature });

export type DataTableColumn<T extends RowData> = ColumnDef<typeof features, T>;

type DataTableProps<T extends RowData> = {
  columns: DataTableColumn<T>[];
  data: T[];
  isLoading?: boolean;
  // Server-side pagination: pass all three, or none for a table without paging.
  pagination?: PaginationState;
  onPaginationChange?: (pagination: PaginationState) => void;
  rowCount?: number;
};

export default function DataTable<T extends RowData>({
  columns,
  data,
  isLoading,
  pagination,
  onPaginationChange,
  rowCount,
}: DataTableProps<T>) {
  const table = useTable({
    features,
    columns,
    data,
    state: pagination && { pagination },
    manualPagination: true,
    rowCount,
  });
  const rows = table.getRowModel().rows;

  return (
    <Paper>
      {isLoading && <LinearProgress />}
      <TableContainer>
        <Table size="small">
          <TableHead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableCell
                    key={header.id}
                    sx={{
                      fontWeight: 700,
                      width: header.column.columnDef.size,
                      minWidth: header.column.columnDef.minSize,
                    }}
                  >
                    {header.isPlaceholder ? null : (
                      <FlexRender header={header} />
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id} hover>
                {row.getAllCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {/* max-width on a <td> is ignored by browsers, so wrap the content */}
                    <Box sx={{ maxWidth: 500, overflowWrap: "anywhere" }}>
                      <FlexRender cell={cell} />
                    </Box>
                  </TableCell>
                ))}
              </TableRow>
            ))}
            {rows.length === 0 && !isLoading && (
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
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
          rowsPerPageOptions={[5, 10, 20, 50, 100]}
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
