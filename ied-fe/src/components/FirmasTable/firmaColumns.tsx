import { ContentCopy } from "@mui/icons-material";
import BusinessIcon from "@mui/icons-material/Business";
import { Icon, Link } from "@mui/material";
import type { MRT_ColumnDef } from "material-react-table";
import type { FirmaType } from "../../schemas/firmaSchemas";

export const firmaColumns: MRT_ColumnDef<FirmaType>[] = [
  {
    header: "R. BR.",
    accessorKey: "rowNumber",
    size: 20,
    enableSorting: false,
    enableColumnActions: false,
    enableColumnFilter: false,
    enableColumnOrdering: false,
    enableHiding: false,
    muiTableHeadCellProps: {
      sx: { position: "sticky", left: 0, zIndex: 2, background: "#fff" },
    },
    muiTableBodyCellProps: {
      sx: { position: "sticky", left: 0, zIndex: 1, background: "#fff" },
    },

    Cell: ({ row, table }) => {
      const pageIndex = table.getState().pagination.pageIndex;
      const pageSize = table.getState().pagination.pageSize;
      return pageIndex * pageSize + row.index + 1;
    },
  },
  {
    header: "Naziv kompanije",
    accessorKey: "naziv_firme",
    Cell: ({ row }: { row: { original: FirmaType } }) => {
      const firma = row.original;
      return (
        <Link
          href={`/Firma/${firma._id}`}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ display: "inline-flex", alignItems: "center" }}
        >
          <Icon
            component={BusinessIcon}
            sx={{ fontSize: 20, marginRight: 0.5 }}
          />
          {firma.naziv_firme}
        </Link>
      );
    },
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
    header: "Adresa",
    accessorKey: "adresa",
  },
  {
    header: "Mesto",
    accessorKey: "mesto",
  },
  {
    header: "Postanski broj",
    accessorKey: "postanski_broj",
  },
  {
    header: "Telefon",
    accessorKey: "telefon",
  },
  {
    header: "Tip firme",
    accessorKey: "tip_firme",
  },
  {
    header: "Velicina firme",
    accessorKey: "velicina_firme",
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
