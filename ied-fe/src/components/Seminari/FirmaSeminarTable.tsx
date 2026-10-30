import { Box, Link } from "@mui/material";
import type { FirmaSeminar, FirmaSeminarSearchParams } from "ied-shared";
import { useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { useSearchFirmaSeminari } from "../../hooks/seminar/useSeminarQueries";
import DataTable, { type DataTableColumn } from "../DataTable/DataTable";
import FirmaSeminarCharts from "./FirmaSeminarCharts";
import FirmaSeminarSubTable from "./FirmaSeminarSubTable";

const noFirmas: FirmaSeminar[] = [];

const seminariTableColumns: DataTableColumn<FirmaSeminar>[] = [
  {
    header: "R. BR.",
    id: "rowNumber",
    size: 20,
    cell: ({ row, table }) => {
      const { pageIndex, pageSize } = table.atoms.pagination.get();
      return pageIndex * pageSize + row.index + 1;
    },
  },
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

export default function FirmaSeminarTable({
  queryParameters,
}: {
  queryParameters: FirmaSeminarSearchParams;
}) {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 25,
  });

  const { data: firmaSeminars, isLoading: isLoadingSeminars } =
    useSearchFirmaSeminari({
      pageSize: pagination.pageSize,
      pageIndex: pagination.pageIndex,
      queryParameters,
    });

  const tableData = useMemo<FirmaSeminar[]>(
    () => firmaSeminars?.firmas ?? noFirmas,
    [firmaSeminars],
  );

  return (
    <DataTable
      columns={seminariTableColumns}
      data={tableData}
      isLoading={isLoadingSeminars}
      pagination={pagination}
      onPaginationChange={setPagination}
      rowCount={firmaSeminars?.totalDocuments || 0}
      renderDetailPanel={(firma) => (
        <Box sx={{ padding: "16px" }}>
          <FirmaSeminarCharts data={firma.seminars} />
          <FirmaSeminarSubTable seminars={firma.seminars} />
        </Box>
      )}
    />
  );
}
