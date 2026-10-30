import { colors } from "@mui/material";
import { ZaposleniSchema, type ZaposleniType } from "ied-shared";
import type { ReactNode } from "react";
import type { DataTableColumn } from "../DataTable/DataTable";

export const getZaposleniColumns = (
  renderActions: (zaposleni: ZaposleniType) => ReactNode,
): DataTableColumn<ZaposleniType>[] => [
  {
    header: "R. BR.",
    id: "rowNumber",
    size: 90,
    // Client-side paging: row.index already counts across pages.
    cell: ({ row }) => row.index + 1,
  },
  {
    header: "Akcije",
    id: "actions",
    size: 190,
    cell: ({ row }) => renderActions(row.original),
  },
  {
    header: "Ime i Prezime",
    accessorFn: (row) => `${row.ime} ${row.prezime}`,
  },
  {
    header: "Email",
    accessorKey: "e_mail",
    meta: {
      copy: true,
      cellSx: (email) =>
        ZaposleniSchema.shape.e_mail.safeParse(email).success
          ? {}
          : { bgcolor: colors.red[100] },
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
    minSize: 400,
    meta: {
      cellSx: () => ({ whiteSpace: "pre-wrap" }), // Preserve line breaks and whitespace
    },
  },
];
