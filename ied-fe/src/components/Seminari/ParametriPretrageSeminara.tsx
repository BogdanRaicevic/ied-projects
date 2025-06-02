import { UnfoldLess } from "@mui/icons-material";
import { TextField, FormControl, Button, Box } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SeminarQueryParamsSchema } from "@ied-shared/index";

export function ParametriPretrageSeminara() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(SeminarQueryParamsSchema),
  });
  return (
    <>
      <h1>Parametri Pretrage</h1>
      <Box component="form" onSubmit={handleSubmit((data) => console.log("Submitted data:", data))}>
        <Controller
          name="naziv"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              sx={{ m: 1 }}
              id="naziv"
              label="Naziv seminara"
              variant="outlined"
              error={!!errors.naziv}
              helperText={errors.naziv?.message}
            />
          )}
        />

        <Controller
          name="predavac"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              sx={{ m: 1 }}
              id="predavac"
              label="Predavac"
              variant="outlined"
              error={!!errors.naziv}
              helperText={errors.naziv?.message}
            />
          )}
        />

        <Controller
          name="lokacija"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              sx={{ m: 1 }}
              id="lokacija"
              label="Lokacija"
              variant="outlined"
              error={!!errors.naziv}
              helperText={errors.naziv?.message}
            />
          )}
        />

        <FormControl sx={{ m: 1 }}>
          <Controller
            name="datumOd"
            control={control}
            render={({ field }) => (
              <DatePicker
                {...field}
                format="yyyy/MM/dd"
                label="Početni datum"
                name="datumOd"
                value={field.value ? new Date(field.value) : null}
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
                label="Kranji datum"
                name="datumDo"
                value={field.value ? new Date(field.value) : null}
                onChange={(date) => field.onChange(date)}
              />
            )}
          />
        </FormControl>
        <Button sx={{ m: 1 }} size="large" variant="contained" color="info" type="submit">
          Pretrazi
        </Button>
      </Box>
    </>
  );
}
