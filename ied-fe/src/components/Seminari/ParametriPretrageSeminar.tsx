import { zodResolver } from "@hookform/resolvers/zod";
import {
  type SeminarQueryParams,
  SeminarQueryParamsSchema,
} from "@ied-shared/types/seminar.zod";
import { UnfoldLess } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  FormControl,
  Grid,
  TextField,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { addMonths, subMonths } from "date-fns";
import { Controller, useForm } from "react-hook-form";
import { useFetchTipoviSeminara } from "../../hooks/useFetchData";
import AutocompleteMultiple from "../Autocomplete/Multiple";

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

  const { data: tipoviSeminara, isLoading, isError } = useFetchTipoviSeminara();

  return (
    <>
      <h1>Parametri Pretrage</h1>
      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Došlo je do greške prilikom učitavanja tipova seminara.
        </Alert>
      )}
      <Grid
        container
        spacing={2}
        component="form"
        onSubmit={handleSubmit((data) => handleFormSubmit(data))}
      >
        <Grid size={9} columns={12} container>
          <Grid size={4}>
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

          <Grid size={4}>
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

          <Grid size={4}>
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

          <Grid size={4}>
            <Controller
              name="tipSeminara"
              control={control}
              render={({ field }) => (
                <AutocompleteMultiple
                  placeholder={isLoading ? "Učitavanje..." : "Tip seminara"}
                  data={tipoviSeminara || []}
                  checkedValues={field.value || []}
                  onCheckedChange={field.onChange}
                  id={"tip-seminara-fs"}
                />
              )}
            />
          </Grid>
        </Grid>

        <Grid size={3} columns={12} container alignItems="center">
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

        <Grid
          size={12}
          sx={{ textAlign: "right", mb: 2 }}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <Button size="large" variant="contained" color="info" type="submit">
            Pretraži
          </Button>
        </Grid>
      </Grid>
    </>
  );
}
