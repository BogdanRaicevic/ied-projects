import { MaterialReactTable, MRT_ColumnDef, useMaterialReactTable } from "material-react-table";
import { useMemo, useState } from "react";
import { useAuditLogs } from "../hooks/fetchAuditLog";
import { AuditLogQueryParams, AuditLogType } from "@ied-shared/types/audit_log";
import { diffJson } from "diff";
import { Controller, useForm } from "react-hook-form";
import { Paper, Grid, TextField, Box, Button } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { subDays } from "date-fns";

export default function Audit() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 50 });
  const [filterParams, setFilterParams] = useState<AuditLogQueryParams>({});
  const { control, handleSubmit } = useForm<AuditLogQueryParams>({
    defaultValues: {
      userEmail: "",
      datumDo: new Date(new Date().setHours(23, 59, 59, 999)),
      datumOd: new Date(subDays(new Date(), 7).setHours(0, 0, 0, 0)),
    },
  });

  const { data, isLoading } = useAuditLogs({
    pageIndex: pagination.pageIndex,
    pageSize: pagination.pageSize,
    filterParams,
  });

  console.log("Audit logs data:", data);
  const auditLogs = data?.data || [];
  const totalDocuments = data?.totalDocuments || 0;

  const auditLogsColumns = useMemo<MRT_ColumnDef<AuditLogType>[]>(
    () => [
      {
        accessorKey: "timestamp",
        header: "Datum",
        Cell: ({ cell }) => {
          const date = cell.getValue<string>();
          return date ? date.slice(0, 10) : "";
        },
        filterFn: (row, columnId, filterValue) => {
          const value = row.getValue<string>(columnId);
          return value?.slice(0, 10) === filterValue;
        },
        filterVariant: "text",
      },
      {
        accessorKey: "userEmail",
        header: "Korisnik",
      },
      {
        accessorKey: "path",
        header: "Putanja",
      },
      {
        header: "Evidencije promena",
        Cell: ({ row }) => {
          const { beforeChanges, requestBody } = row.original;

          // If there's no 'before' state, it's a new creation. Show the whole body as added.
          if (!beforeChanges) {
            return (
              <pre style={{ margin: 0, backgroundColor: "#ddfadd" }}>
                {JSON.stringify(requestBody, null, 2)}
              </pre>
            );
          }

          const filteredBeforeChanges = requestBody
            ? Object.keys(requestBody).reduce(
                (filtered, key) => {
                  // Only copy fields that exist in requestBody
                  if (key in beforeChanges) {
                    filtered[key] = beforeChanges[key as keyof typeof beforeChanges];
                  }
                  return filtered;
                },
                {} as Record<string, any>
              )
            : beforeChanges;

          const differences = diffJson(filteredBeforeChanges || "", requestBody || "");

          return (
            <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
              {differences
                .filter((part) => part.added || part.removed)
                .map((part, index) => {
                  const style = {
                    backgroundColor: part.added ? "#ddfadd" : "#fadddd",
                  };
                  return (
                    <span key={index} style={style}>
                      {part.value}
                    </span>
                  );
                })}
            </pre>
          );
        },
      },
    ],
    []
  );

  const auditLogsTable = useMaterialReactTable({
    columns: auditLogsColumns,
    data: auditLogs || [],
    state: {
      isLoading,
      pagination,
    },
    enableColumnOrdering: true,
    enableColumnPinning: true,
    paginationDisplayMode: "default",
    positionToolbarAlertBanner: "bottom",
    manualPagination: true,
    onPaginationChange: setPagination,
    rowCount: totalDocuments,
  });

  const onSearch = (formData: AuditLogQueryParams) => {
    // Reset to first page when searching
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));

    const newFilterParams: AuditLogQueryParams = {};

    if (formData.userEmail) {
      newFilterParams.userEmail = formData.userEmail;
    }

    if (formData.datumOd) {
      newFilterParams.datumOd = formData.datumOd;
    }

    if (formData.datumDo) {
      newFilterParams.datumDo = formData.datumDo;
    }

    // Update filter params to trigger a new query
    setFilterParams(newFilterParams);
  };

  return (
    <div>
      <h1>Audit</h1>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box component="form" onSubmit={handleSubmit(onSearch)}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={4}>
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

            <Grid size={4}>
              <Controller
                name="datumOd"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    label="Datum od"
                    value={field.value}
                    onChange={(date) => field.onChange(date)}
                    format="yyyy-MM-dd"
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                )}
              />
            </Grid>

            <Grid size={4}>
              <Controller
                name="datumDo"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    label="Datum do"
                    value={field.value}
                    onChange={(date) => field.onChange(date)}
                    format="yyyy-MM-dd"
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                )}
              />
            </Grid>

            <Box display="flex" justifyContent="flex-end">
              <Button type="submit" variant="contained" color="primary" fullWidth>
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
