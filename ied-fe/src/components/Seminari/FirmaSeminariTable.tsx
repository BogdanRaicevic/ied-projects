import type {
  SeminarQueryParams,
  SeminarZodType,
} from "ied-shared/dist/types/seminar.zod";
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  useMaterialReactTable,
} from "material-react-table";
import { useMemo } from "react";
import { useSearchFirmaSeminari } from "../../hooks/seminar/useSeminarQueries";

export default function FirmaSeminariTable({
  queryParameters,
}: {
  queryParameters: SeminarQueryParams;
}) {
  console.log("FirmaSeminariTable queryParameters:", queryParameters);

  const { firmaSeminars, isLoading } = useSearchFirmaSeminari({
    pageSize: 50,
    pageIndex: 0,
    queryParameters: {}, // TODO: fix
  });

  console.log("firmas:", firmaSeminars);

  // fix the type
  const seminariTableColumns: MRT_ColumnDef<any>[] = [
    {
      accessorKey: "naziv",
      header: "Naziv firme",
      Cell: ({ row }) => row.original.naziv || row.original.firmaId || "N/A",
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

  const table = useMaterialReactTable({
    columns: useMemo<MRT_ColumnDef<any>[]>(() => seminariTableColumns, []),
    state: { isLoading: isLoading, showProgressBars: isLoading },
    data: useMemo<any[]>(() => firmaSeminars?.firmas || [], [firmaSeminars]),
    enableColumnFilterModes: true,
    enableColumnOrdering: true,
    enableColumnPinning: true,
    paginationDisplayMode: "default",
    positionToolbarAlertBanner: "bottom",
    manualPagination: true,
    // onPaginationChange: setPagination,
    enablePagination: true,
    rowCount: firmaSeminars?.totalDocuments || 0,
    // enableExpanding: true,
  });

  return <MaterialReactTable table={table} />;
}
