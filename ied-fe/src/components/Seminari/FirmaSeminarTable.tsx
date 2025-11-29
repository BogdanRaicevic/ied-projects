import { Box, Link } from "@mui/material";
import type { SeminarQueryParams } from "ied-shared/dist/types/seminar.zod";
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  useMaterialReactTable,
} from "material-react-table";
import { useMemo } from "react";
import { Link as RouterLink } from "react-router-dom";
import { useSearchFirmaSeminari } from "../../hooks/seminar/useSeminarQueries";
import FirmaSeminarSubTable from "./FirmaSeminarSubTable";

export default function FirmaSeminarTable({
  queryParameters,
}: {
  queryParameters: SeminarQueryParams;
}) {
  console.log("FirmaSeminarTable queryParameters:", queryParameters);

  const { firmaSeminars, isLoading } = useSearchFirmaSeminari({
    pageSize: 50,
    pageIndex: 0,
    queryParameters: {}, // TODO: fix query parameters
  });

  console.log("firmas:", firmaSeminars);

  // TODO: fix the type
  const seminariTableColumns: MRT_ColumnDef<any>[] = [
    {
      accessorKey: "naziv",
      header: "Naziv firme",
      Cell: ({ row }) => (
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
    enablePagination: true,
    rowCount: firmaSeminars?.totalDocuments || 0,
    enableExpanding: true,
    renderDetailPanel: ({ row }) => (
      <Box sx={{ padding: "16px", backgroundColor: "#f5f5f5" }}>
        <FirmaSeminarSubTable seminars={row.original.seminars} />
      </Box>
    ),
  });

  return <MaterialReactTable table={table} />;
}
