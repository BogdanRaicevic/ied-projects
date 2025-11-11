import { zodResolver } from "@hookform/resolvers/zod";
import {
  type SeminarQueryParams,
  SeminarQueryParamsSchema,
} from "@ied-shared/types/seminar.zod";
import { UnfoldLess } from "@mui/icons-material";
import { Box, Button, FormControl, Grid, TextField } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { addMonths, subMonths } from "date-fns";
import { Controller, useForm } from "react-hook-form";

export function ParametriPretrageSeminar({
  onSubmit,
}: {
  onSubmit: (data: SeminarQueryParams) => void;
}) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(SeminarQueryParamsSchema),
    defaultValues: {
      datumOd: subMonths(new Date(), 3),
      datumDo: addMonths(new Date(), 3),
    },
  });

  const handleFormSubmit = (data: SeminarQueryParams) => {
    onSubmit(data);
  };
  return (
    <>
      <h1>Parametri Pretrage</h1>
      <Grid
        container
        spacing={2}
        component="form"
        onSubmit={handleSubmit((data) => handleFormSubmit(data))}
      >
        <Grid size={3}>
          <Controller
            name="naziv"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Naziv seminara"
                variant="outlined"
                error={!!errors.naziv}
                helperText={errors.naziv?.message}
                fullWidth
              />
            )}
          />
        </Grid>

        <Grid size={3}>
          <Controller
            name="predavac"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Predavač"
                variant="outlined"
                error={!!errors.predavac}
                helperText={errors.predavac?.message}
                fullWidth
              />
            )}
          />
        </Grid>

        <Grid size={3}>
          <Controller
            name="lokacija"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Lokacija"
                variant="outlined"
                error={!!errors.lokacija}
                helperText={errors.lokacija?.message}
                fullWidth
              />
            )}
          />
        </Grid>

        <Grid size={3}>
          <FormControl fullWidth>
            <Controller
              name="datumOd"
              control={control}
              render={({ field }) => (
                <DatePicker
                  {...field}
                  format="yyyy/MM/dd"
                  label="Početni datum"
                  name="datumOd"
                  value={field.value as Date | null}
                  onChange={(date) => field.onChange(date)}
                />
              )}
            />
            <Box display="flex" alignItems="center" justifyContent="center">
              <UnfoldLess />
            </Box>
            <Controller
              name="datumDo"
              control={control}
              render={({ field }) => (
                <DatePicker
                  {...field}
                  format="yyyy/MM/dd"
                  label="Krajnji datum"
                  name="datumDo"
                  value={field.value as Date | null}
                  onChange={(date) => field.onChange(date)}
                />
              )}
            />
          </FormControl>
        </Grid>

        <Button size="large" variant="contained" color="info" type="submit">
          Pretrazi
        </Button>
      </Grid>
    </>
  );
}
