import { ContentCopy } from "@mui/icons-material";
import { MRT_ColumnDef } from "material-react-table";
import { Company, Zaposleni } from "../../schemas/companySchemas";
import { Link } from "react-router-dom";
import PrijavaOdjava from "../PrijavaOdjava";

export const myCompanyColumns: MRT_ColumnDef<Company>[] = [
  {
    header: "Naziv kompanije",
    accessorKey: "naziv",
    Cell: ({ row }) => {
      return (
        <Link to={`/Firma`} state={row.original}>
          {row.original.naziv}
        </Link>
      );
    },
  },
  {
    header: "Prijavljeni",
    accessorKey: "zeleMarketingMaterijal",
    Cell: ({ row }) => {
      // row.original.zeleMarketingMaterijal ? "Da" : "Ne";
      return <PrijavaOdjava></PrijavaOdjava>;
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
    // TODO: Fix this
    // muiTableBodyCellCopyButtonProps: {
    // fullWidth: true,
    // startIcon: <ContentCopy />,
    // sx: { justifyContent: "flex-start" },
    // },
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
    // TODO: Fix this
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
