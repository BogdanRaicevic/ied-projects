import type { SeminarDetail } from "ied-shared";
import { formatDatumi, formatToRSDNumber } from "../../utils/helpers";
import type { DataTableColumn } from "../DataTable/DataTable";

export const firmaSeminarSubColumns: DataTableColumn<SeminarDetail>[] = [
  {
    accessorKey: "naziv",
    header: "Naziv seminara",
  },
  {
    accessorFn: (originalRow) => formatDatumi(originalRow.datumi),
    header: "Datum",
    id: "datum",
  },
  {
    accessorKey: "predavac",
    header: "Predavač",
  },
  {
    accessorKey: "offlineCena",
    header: "Cena (offline)",
    cell: ({ getValue }) => formatToRSDNumber(getValue<number>()),
  },
  {
    accessorKey: "onlineCena",
    header: "Cena (online)",
    cell: ({ getValue }) => formatToRSDNumber(getValue<number>()),
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
