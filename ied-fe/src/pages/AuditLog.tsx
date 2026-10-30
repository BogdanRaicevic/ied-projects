import { Paper, Tab, Tabs, Typography } from "@mui/material";
import { grey } from "@mui/material/colors";
import { Box } from "@mui/system";
import { endOfDay, formatDate, startOfDay, subMonths } from "date-fns";
import type { AuditLogQueryParams, AuditLogType } from "ied-shared";
import { useMemo, useState } from "react";
import { AuditChangesViewer } from "../components/AuditChangesViewer/AuditChangesViewer";
import AuditLogSearchForm from "../components/AuditChangesViewer/AuditLogSearchForm";
import AuditOverview from "../components/AuditChangesViewer/AuditOverview";
import AuditOverviewDetails from "../components/AuditChangesViewer/AuditOverviewDetails";
import DataTable, {
  type DataTableColumn,
} from "../components/DataTable/DataTable";
import PageTitle from "../components/PageTitle";
import AddedChip from "../components/styled/AddedChip";
import RemovedChip from "../components/styled/RemovedChip";
import {
  useAuditLogStatsByDate,
  useAuditLogs,
} from "../hooks/auditLogs/useAuditLogQueries";
import { generateStructuredDiff } from "../utils/diffGenerator";

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

  const { data: auditLogs, totalDocuments } = data || {
    auditLogs: [],
    totalDocuments: 0,
  };

  const auditLogsColumns = useMemo<DataTableColumn<AuditLogType>[]>(
    () => [
      {
        header: "R. BR.",
        id: "rowNumber",
        size: 90,
        cell: ({ row, table }) => {
          const { pageIndex, pageSize } = table.atoms.pagination.get();
          return pageIndex * pageSize + row.index + 1;
        },
      },
      {
        accessorKey: "timestamp",
        header: "Timestamp",
        cell: ({ getValue }) => {
          const date = getValue<Date>();
          return formatDate(date, "yyyy-MM-dd");
        },
      },
      {
        accessorKey: "userEmail",
        header: "Korisnik",
      },
      {
        accessorKey: "resource.model",
        header: "Tip resursa",
        cell: ({ row }) => {
          const { resource, before, after } = row.original;
          const doc = after || before;
          const model = resource.model;
          if (!doc) {
            return "N/A";
          }
          const id = doc._id;
          let name = "";

          if (model === "Firma") {
            name = doc.naziv_firme || "Nema naziv";
          } else if (model === "Seminar") {
            name = doc.naziv || "Nema naziv";
          }

          return (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
              }}
            >
              {model}
              <div>{name}</div>
              <small style={{ color: grey[500] }}>ID: {id}</small>
            </Box>
          );
        },
      },

      {
        header: "Promene",
        minSize: 500,
        cell: ({ row }) => {
          const { before, after } = row.original;

          const changes = generateStructuredDiff(before, after);

          // Handle root document deletion
          if (before && !after) {
            return (
              <Box>
                <RemovedChip label="obrisano" />
              </Box>
            );
          }

          // Handle root document creation
          if (!before && after) {
            return (
              <Box>
                <AddedChip label="dodato" />
              </Box>
            );
          }

          if (!changes) {
            return null;
          }

          return <AuditChangesViewer changes={changes} />;
        },
      },
    ],
    [],
  );

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
            columns={auditLogsColumns}
            data={auditLogs ?? noAuditLogs}
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
