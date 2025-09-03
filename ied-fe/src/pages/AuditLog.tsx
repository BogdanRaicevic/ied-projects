import type {
  AuditLogQueryParams,
  AuditLogType,
} from "@ied-shared/types/audit_log.zod";
import { Button, Paper, TextField } from "@mui/material";
import { green, grey, red } from "@mui/material/colors";
import { Box, Grid } from "@mui/system";
import { DatePicker } from "@mui/x-date-pickers";
import { endOfDay, formatDate, startOfDay, subDays } from "date-fns";
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  useMaterialReactTable,
} from "material-react-table";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { AuditChangesViewer } from "../components/AuditChangesViewer/AuditChangesViewer";
import { useAuditLogs } from "../hooks/useAuditLogs";
import { generateStructuredDiff } from "../utils/diffGenerator";

export default function AuditLog() {
  const [queryParams, setQueryParams] = useState<AuditLogQueryParams>({
    userEmail: "",
    dateFrom: startOfDay(subDays(new Date(), 7)),
    dateTo: endOfDay(new Date()),
    model: "",
  });
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5,
  });

  const { data, isLoading } = useAuditLogs({
    ...queryParams,
    pageIndex: pagination.pageIndex,
    pageSize: pagination.pageSize,
  });
  const { control, handleSubmit } = useForm<AuditLogQueryParams>({
    defaultValues: queryParams,
  });

  const { data: auditLogs, totalDocuments } = data || {
    auditLogs: [],
    totalDocuments: 0,
  };

  const auditLogsColumns = useMemo<MRT_ColumnDef<AuditLogType>[]>(
    () => [
      {
        accessorKey: "timestamp",
        header: "Timestamp",
        Cell: ({ cell }) => {
          const date = cell.getValue<Date>();
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
        Cell: ({ row }) => {
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
        Cell: ({ row }) => {
          const { before, after } = row.original;

          const changes = useMemo(
            () => generateStructuredDiff(before, after),
            [before, after],
          );

          // Handle root document deletion
          if (before && !after) {
            return (
              <Box>
                <span
                  style={{
                    backgroundColor: red[100],
                    color: red[900],
                    padding: "4px 8px",
                    borderRadius: "4px",
                    fontWeight: "bold",
                  }}
                >
                  OBRISANO
                </span>
              </Box>
            );
          }

          // Handle root document creation
          if (!before && after) {
            return (
              <Box>
                <span
                  style={{
                    backgroundColor: green[100],
                    color: green[900],
                    padding: "4px 8px",
                    borderRadius: "4px",
                    fontWeight: "bold",
                  }}
                >
                  NOVO
                </span>
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

  const auditLogsTable = useMaterialReactTable({
    columns: auditLogsColumns,
    data: auditLogs || [],
    state: {
      isLoading,
      pagination: {
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
      },
    },
    enableColumnFilterModes: true,
    enableColumnOrdering: true,
    enableColumnPinning: true,
    paginationDisplayMode: "default",
    positionToolbarAlertBanner: "bottom",
    manualPagination: true,
    onPaginationChange: setPagination,
    enablePagination: true,
    rowCount: totalDocuments,
  });

  const onSearch = (data: AuditLogQueryParams) => {
    setQueryParams(data);
  };

  return (
    <div>
      <h1>Evidencija Promena</h1>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box component="form" onSubmit={handleSubmit(onSearch)}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={3}>
              <Controller
                name="userEmail"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Email korisnika"
                    variant="outlined"
                    fullWidth
                    placeholder="Pretraga po email adresi..."
                  />
                )}
              />
            </Grid>

            <Grid size={3}>
              <Controller
                name="model"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Tip resursa"
                    variant="outlined"
                    fullWidth
                    placeholder="Pretraga po tipu resursa..."
                  />
                )}
              />
            </Grid>

            <Grid size={3}>
              <Controller
                name="dateFrom"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    label="Datum od"
                    value={field.value}
                    onChange={(date) =>
                      field.onChange(date ? startOfDay(date) : null)
                    }
                    format="yyyy-MM-dd"
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                )}
              />
            </Grid>

            <Grid size={3}>
              <Controller
                name="dateTo"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    label="Datum do"
                    value={field.value}
                    onChange={(date) =>
                      field.onChange(date ? endOfDay(date) : null)
                    }
                    format="yyyy-MM-dd"
                    slotProps={{ textField: { fullWidth: true } }}
                    disableFuture={true}
                  />
                )}
              />
            </Grid>

            <Box display="flex" justifyContent="flex-end">
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
              >
                Pretraga
              </Button>
            </Box>
          </Grid>
        </Box>
      </Paper>

      <MaterialReactTable table={auditLogsTable} />
    </div>
  );
}
