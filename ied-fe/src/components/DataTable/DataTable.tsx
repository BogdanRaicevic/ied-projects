import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import {
  type ColumnDef,
  columnSizingFeature,
  FlexRender,
  type RowData,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";

const features = tableFeatures({ columnSizingFeature });

export type DataTableColumn<T extends RowData> = ColumnDef<typeof features, T>;

type DataTableProps<T extends RowData> = {
  columns: DataTableColumn<T>[];
  data: T[];
};

export default function DataTable<T extends RowData>({
  columns,
  data,
}: DataTableProps<T>) {
  const table = useTable({ features, columns, data });

  return (
    <TableContainer component={Paper}>
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
                  }}
                >
                  {header.isPlaceholder ? null : <FlexRender header={header} />}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableHead>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id} hover>
              {row.getAllCells().map((cell) => (
                <TableCell key={cell.id}>
                  <FlexRender cell={cell} />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
