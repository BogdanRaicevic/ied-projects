import BusinessIcon from "@mui/icons-material/Business";
import { colors, Icon, Link } from "@mui/material";
import { FirmaSchema, type FirmaType } from "ied-shared";
import type { DataTableColumn } from "../DataTable/DataTable";

export const firmaColumns: DataTableColumn<FirmaType>[] = [
  {
    header: "Naziv kompanije",
    accessorKey: "naziv_firme",
    size: 250,
    cell: ({ row }) => {
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
    size: 200,
    accessorKey: "e_mail",
    meta: {
      copy: true,
      cellSx: (email) =>
        FirmaSchema.shape.e_mail.safeParse(email).success
          ? {}
          : { bgcolor: colors.red[100] },
    },
  },

  {
    header: "Adresa",
    accessorKey: "adresa",
  },
  {
    header: "Mesto",
    id: "mesto",
    accessorFn: (firma) => firma.mesto?.naziv_mesto ?? "",
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
    size: 500,
    meta: {
      cellSx: () => ({ whiteSpace: "pre-wrap" }), // Preserve line breaks and whitespace
    },
  },
];
