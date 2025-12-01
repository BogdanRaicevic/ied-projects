import {
  MaterialReactTable,
  type MRT_ColumnDef,
  useMaterialReactTable,
} from "material-react-table";
import { useMemo } from "react";
import { formatToRSDNumber } from "../../utils/helpers";
import type { SeminarDetail } from "./FirmaSeminarTable";

export default function FirmaSeminarSubTable({
  seminars,
}: {
  seminars: SeminarDetail[];
}) {
  const seminariTableColumns = useMemo<MRT_ColumnDef<any>[]>(
    () => [
      {
        header: "R. BR.",
        id: "rowNumber",
        size: 20,
        Cell: ({ row }) => row.index + 1,
        enableSorting: false,
        enableColumnActions: false,
        enableColumnFilter: false,
        enableColumnOrdering: false,
        enableHiding: false,
      },
      {
        accessorKey: "naziv",
        header: "Naziv seminara",
      },
      {
        accessorFn: (originalRow) =>
          new Date(originalRow.datum).toLocaleDateString(),
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
        Cell: ({ cell }) => formatToRSDNumber(cell.getValue<number>()),
      },
      {
        accessorKey: "onlineCena",
        header: "Cena (online)",
        Cell: ({ cell }) => formatToRSDNumber(cell.getValue<number>()),
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
    ],
    [],
  );

  const table = useMaterialReactTable({
    columns: seminariTableColumns,
    data: seminars ?? [],
    enablePagination: false,
    enableColumnActions: false,
    enableTopToolbar: false,
    enableBottomToolbar: false,
    positionToolbarAlertBanner: "bottom",
  });

  return <MaterialReactTable table={table} />;
}
