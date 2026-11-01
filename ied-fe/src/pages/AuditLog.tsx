import { Paper, Tab, Tabs, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { endOfDay, startOfDay, subMonths } from "date-fns";
import type { AuditLogQueryParams, AuditLogType } from "ied-shared";
import { useState } from "react";
import AuditLogSearchForm from "../components/AuditChangesViewer/AuditLogSearchForm";
import AuditOverview from "../components/AuditChangesViewer/AuditOverview";
import AuditOverviewDetails from "../components/AuditChangesViewer/AuditOverviewDetails";
import { auditLogColumns } from "../components/AuditChangesViewer/auditLogColumns";
import DataTable from "../components/DataTable/DataTable";
import PageTitle from "../components/PageTitle";
import {
  useAuditLogStatsByDate,
  useAuditLogs,
} from "../hooks/auditLogs/useAuditLogQueries";

// Stable reference: a new [] each render makes TanStack Table rebuild rows and reset expanded state.
const noAuditLogs: AuditLogType[] = [];

export default function AuditLog() {
  const [queryParams, setQueryParams] = useState<AuditLogQueryParams>({
    userEmail: "",
    dateFrom: startOfDay(subMonths(new Date(), 1)),
    dateTo: endOfDay(new Date()),
    model: "",
  });
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5,
  });
  const [activeTab, setActiveTab] = useState(0);

  const { data, isLoading } = useAuditLogs({
    params: queryParams,
    pageIndex: pagination.pageIndex,
    pageSize: pagination.pageSize,
  });

  const { data: auditStats } = useAuditLogStatsByDate(queryParams);

  const auditLogs = data?.data ?? noAuditLogs;
  const totalDocuments = data?.totalDocuments ?? 0;

  const onSearch = (data: AuditLogQueryParams) => {
    setQueryParams(data);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ mt: 3, mb: 5 }}>
      <PageTitle title="Evidencija Promena" />
      <AuditLogSearchForm onSearch={onSearch} defaultValues={queryParams} />
      <Box>
        <Box>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Pregled izmena" value={0} />
            <Tab label="Detalji izmena" value={1} />
          </Tabs>
        </Box>
      </Box>
      {activeTab === 1 && (
        <Box>
          <DataTable
            columns={auditLogColumns}
            data={auditLogs}
            isLoading={isLoading}
            pagination={pagination}
            onPaginationChange={setPagination}
            rowCount={totalDocuments}
          />
        </Box>
      )}
      {activeTab === 0 &&
        (queryParams.userEmail ? (
          auditStats && (
            <Box>
              <AuditOverview auditData={auditStats} />
              <AuditOverviewDetails auditData={auditStats} />
            </Box>
          )
        ) : (
          <Paper sx={{ p: 3, mt: 2, textAlign: "center" }}>
            <Typography>Dodajte email u pretragu</Typography>
          </Paper>
        ))}
    </Box>
  );
}
