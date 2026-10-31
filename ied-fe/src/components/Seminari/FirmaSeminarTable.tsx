import { Box } from "@mui/material";
import type { FirmaSeminar, FirmaSeminarSearchParams } from "ied-shared";
import { useState } from "react";
import { useSearchFirmaSeminari } from "../../hooks/seminar/useSeminarQueries";
import DataTable from "../DataTable/DataTable";
import FirmaSeminarCharts from "./FirmaSeminarCharts";
import FirmaSeminarSubTable from "./FirmaSeminarSubTable";
import { firmaSeminarColumns } from "./firmaSeminarColumns";

const noFirmas: FirmaSeminar[] = [];

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

  const tableData = firmaSeminars?.firmas ?? noFirmas;

  return (
    <DataTable
      columns={firmaSeminarColumns}
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
