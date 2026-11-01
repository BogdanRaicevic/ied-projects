import { Link } from "@mui/material";
import type { FirmaSeminar } from "ied-shared";
import { Link as RouterLink } from "react-router-dom";
import type { DataTableColumn } from "../DataTable/DataTable";

export const firmaSeminarColumns: DataTableColumn<FirmaSeminar>[] = [
  {
    accessorKey: "naziv",
    header: "Naziv firme",
    cell: ({ row }) => (
      <Link component={RouterLink} to={`/firma/${row.original.firmaId}`}>
        {row.original.naziv || row.original.firmaId || "N/A"}
      </Link>
    ),
  },
  {
    accessorKey: "email",
    header: "Email firme",
  },
  {
    accessorKey: "mesto",
    header: "Mesto firme",
  },
  {
    accessorKey: "tipFirme",
    header: "Tip firme",
  },
  {
    accessorKey: "delatnost",
    header: "Delatnost firme",
  },
  {
    accessorKey: "brojSeminara",
    header: "Broj posećenih seminara",
  },
  {
    accessorKey: "totalUcesnici",
    header: "Ukupan broj učesnika",
  },
  {
    accessorKey: "onlineUcesnici",
    header: "Broj online učesnika",
  },
  {
    accessorKey: "offlineUcesnici",
    header: "Broj offline učesnika",
  },
];
