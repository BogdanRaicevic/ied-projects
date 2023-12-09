import { ContentCopy } from "@mui/icons-material";
import { MRT_ColumnDef } from "material-react-table";
import { Company, Zaposleni } from "../../schemas/companySchemas";
import { Link } from "react-router-dom";

export const myCompanyColumns: MRT_ColumnDef<Company>[] = [
  {
    header: "Prijavljeni",
    accessorKey: "zeleMarketingMaterijal",
    muiTableBodyCellProps: ({ cell }) => ({
      sx: {
        backgroundColor: cell.getValue() === true ? "#47e147" : "salmon",
      },
    }),
    Cell: ({ cell }) => <span>{cell.getValue<boolean>() ? "DA" : "Ne"}</span>,
  },
  {
    header: "Naziv kompanije",
    accessorKey: "naziv",
    Cell: ({ row }) => {
      const firma = row.original;
      return (
        <Link to={`/Firma`} state={firma}>
          {firma.naziv}
        </Link>
      );
    },
  },
  {
    header: "Sajt",
    accessorKey: "sajt",
  },
  {
    header: "Email",
    accessorKey: "email",
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
    header: "Grad",
    accessorKey: "grad",
  },
  {
    header: "Opstina",
    accessorKey: "opstina",
  },
  {
    header: "Postanski broj",
    accessorKey: "ptt",
  },
  {
    header: "Telefon",
    accessorKey: "telefon",
  },
  {
    header: "Tip firme",
    accessorKey: "tip",
  },
  {
    header: "Velicina",
    accessorKey: "velicina",
  },
  {
    header: "Stanje",
    accessorKey: "stanje",
  },
  {
    header: "Odjava",
    id: "odjava",
  },
  {
    header: "Komentari",
    accessorKey: "komentari",
  },
];

export const myZaposleniColumns: MRT_ColumnDef<Zaposleni>[] = [
  {
    header: "Ime i Prezime",
    accessorFn: (row) => `${row.ime} ${row.prezime}`,
  },
  {
    header: "Email",
    accessorKey: "email",
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
];
