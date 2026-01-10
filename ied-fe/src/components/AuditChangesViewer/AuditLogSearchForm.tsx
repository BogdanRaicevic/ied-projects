import { Button, Paper, TextField, Typography } from "@mui/material";
import { Box, Grid } from "@mui/system";
import { DatePicker } from "@mui/x-date-pickers";
import { endOfDay, startOfDay } from "date-fns";
import type { AuditLogQueryParams } from "ied-shared";
import { Controller, useForm } from "react-hook-form";

interface AuditLogSearchFormProps {
  defaultValues: AuditLogQueryParams;
  onSearch: (data: AuditLogQueryParams) => void;
}

export default function AuditLogSearchForm({
  defaultValues,
  onSearch,
}: AuditLogSearchFormProps) {
  const { control, handleSubmit } = useForm<AuditLogQueryParams>({
    defaultValues,
  });

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="h4" gutterBottom>
        Parametri pretrage
      </Typography>
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
                  disableFuture
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
  );
}
