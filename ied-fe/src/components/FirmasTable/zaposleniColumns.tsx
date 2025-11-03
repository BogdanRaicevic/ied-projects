import { ContentCopy } from "@mui/icons-material";
import type { ZaposleniType } from "ied-shared";
import type { MRT_ColumnDef } from "material-react-table";

export const zaposleniColumns: MRT_ColumnDef<ZaposleniType>[] = [
  {
    header: "R. BR.",
    accessorKey: "rowNumber",
    size: 20,
    enableSorting: false,
    enableColumnActions: false,
    enableColumnFilter: false,
    enableColumnOrdering: false,
    enableHiding: false,
    Cell: ({ row, table }) => {
      const pageIndex = table.getState().pagination.pageIndex;
      const pageSize = table.getState().pagination.pageSize;
      return pageIndex * pageSize + row.index + 1;
    },
  },
  {
    header: "Ime i Prezime",
    accessorFn: (row) => `${row.ime} ${row.prezime}`,
  },
  {
    header: "Email",
    accessorKey: "e_mail",
    enableClickToCopy: true,
    muiCopyButtonProps: {
      fullWidth: true,
      startIcon: <ContentCopy />,
      sx: { justifyContent: "flex-start" },
    },
  },
  {
    header: "Telefon",
    accessorKey: "telefon",
  },
  {
    header: "Radna mesta",
    accessorKey: "radno_mesto",
  },
  {
    header: "Komentari",
    accessorKey: "komentar",
    muiTableHeadCellProps: {
      sx: {
        minWidth: "400px",
      },
    },
    muiTableBodyCellProps: {
      sx: {
        whiteSpace: "pre-wrap", // Preserve line breaks and whitespace
      },
    },
  },
];
