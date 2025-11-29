import { Box, Link } from "@mui/material";
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  type MRT_PaginationState,
  useMaterialReactTable,
} from "material-react-table";
import { useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { useSearchFirmaSeminari } from "../../hooks/seminar/useSeminarQueries";
import FirmaSeminarSubTable from "./FirmaSeminarSubTable";

export type SeminarDetail = {
  seminar_id: string;
  naziv: string;
  predavac: string;
  datum: string;
  offlineCena: number;
  onlineCena: number;
  totalUcesnici: number;
  onlineUcesnici: number;
  offlineUcesnici: number;
};

type FirmaSeminar = {
  firmaId: string;
  naziv: string;
  email: string;
  mesto: string;
  tipFirme: string;
  delatnost: string;
  brojSeminara: number;
  totalUcesnici: number;
  onlineUcesnici: number;
  offlineUcesnici: number;
  seminars: SeminarDetail[];
};

export default function FirmaSeminarTable({
  queryParameters,
}: {
  queryParameters: any; // TODO: fix query parameters
}) {
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 50,
  });

  const { firmaSeminars, isLoading } = useSearchFirmaSeminari({
    pageSize: pagination.pageSize,
    pageIndex: pagination.pageIndex,
    queryParameters,
  });

  // TODO: fix the type
  const seminariTableColumns: MRT_ColumnDef<FirmaSeminar>[] = [
    {
      header: "R. BR.",
      accessorKey: "rowNumber",
      size: 20,
      enableSorting: false,
      enableColumnActions: false,
      enableColumnFilter: false,
      enableColumnOrdering: false,
      enableHiding: false,

      Cell: ({ row, table }) => {
        const pageIndex = table.getState().pagination.pageIndex;
        const pageSize = table.getState().pagination.pageSize;
        return pageIndex * pageSize + row.index + 1;
      },
    },
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
    columns: useMemo<MRT_ColumnDef<FirmaSeminar>[]>(
      () => seminariTableColumns,
      [],
    ),
    state: { isLoading, showProgressBars: isLoading, pagination },
    data: useMemo<FirmaSeminar[]>(
      () => firmaSeminars?.firmas || [],
      [firmaSeminars],
    ),
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
      <Box sx={{ padding: "16px" }}>
        <FirmaSeminarSubTable seminars={row.original.seminars} />
      </Box>
    ),
    onPaginationChange: setPagination,
  });

  return <MaterialReactTable table={table} />;
}
