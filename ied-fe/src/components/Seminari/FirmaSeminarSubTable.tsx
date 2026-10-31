import type { SeminarDetail } from "ied-shared";
import { formatDatumi, formatToRSDNumber } from "../../utils/helpers";
import DataTable, { type DataTableColumn } from "../DataTable/DataTable";

const seminariTableColumns: DataTableColumn<SeminarDetail>[] = [
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

export default function FirmaSeminarSubTable({
  seminars,
}: {
  seminars: SeminarDetail[];
}) {
  return <DataTable columns={seminariTableColumns} data={seminars ?? []} />;
}
