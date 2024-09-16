import { ContentCopy } from "@mui/icons-material";
import { MRT_ColumnDef } from "material-react-table";
import { Company, Zaposleni } from "../../schemas/companySchemas";
import { Link } from "react-router-dom";

export const myCompanyColumns: MRT_ColumnDef<Company>[] = [
  // {
  //   header: "Prijavljeni",
  //   accessorKey: "zeleMarketingMaterijal",
  //   muiTableBodyCellProps: ({ cell }) => ({
  //     sx: {
  //       backgroundColor: cell.getValue() === true ? "#47e147" : "salmon",
  //     },
  //   }),
  //   Cell: ({ cell }) => <span>{cell.getValue<boolean>() ? "DA" : "Ne"}</span>,
  // },
  {
    header: "Naziv kompanije",
    accessorKey: "naziv_firme",
    Cell: ({ row }: { row: { original: Company } }) => {
      const firma = row.original;
      return <Link to={`/Firma/${firma._id}`}>{firma.naziv_firme}</Link>;
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
    header: "Velicina",
    accessorKey: "velicina",
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

export const myZaposleniColumns: MRT_ColumnDef<Zaposleni>[] = [
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
    accessorFn: (row) => row.radno_mesto,
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
    // accessorFn: (row) =>
    //   row.komentari.substring(0, 100) + (row.komentari.length > 100 ? "..." : ""),
  },
];
