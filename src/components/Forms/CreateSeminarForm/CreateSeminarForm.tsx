import { TextField, Autocomplete, FormControl, Button, Box } from "@mui/material";
import { tipoviSeminara } from "../../../fakeData/seminarsData";
import { Controller, useForm } from "react-hook-form";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { Seminar, SeminarSchema } from "../../../schemas/companySchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import Grid2 from "@mui/material/Unstable_Grid2/Grid2";

interface CreateSeminarFormProps {
  onAddSeminar: (data: any) => void;
}

export default function CreateSeminarForm({ onAddSeminar }: CreateSeminarFormProps) {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<Seminar>({
    resolver: zodResolver(SeminarSchema),
    defaultValues: {
      datum: new Date(),
    },
  });

  const handleSaveSeminar = (data: any) => {
    onAddSeminar(data);
  };

  const onError = (errors: any, e: any) => {
    console.log(errors, e);
  };

  return (
    <Box onSubmit={handleSubmit(handleSaveSeminar, onError)} component="form">
      <Grid2 container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
        <Grid2 xs={4}>
          <Controller
            name="naziv"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <TextField
                fullWidth
                sx={{ m: 1 }}
                id="naziv"
                label="Naziv"
                variant="outlined"
                {...field}
                error={Boolean(errors.naziv)}
                helperText={errors.naziv?.message}
              />
            )}
          ></Controller>
        </Grid2>
        <Grid2 xs={4}>
          <Controller
            name="predavac"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <TextField
                fullWidth
                sx={{ m: 1 }}
                id="predavac"
                label="Predavac"
                variant="outlined"
                {...field}
                error={Boolean(errors.predavac)}
                helperText={errors.predavac?.message}
              />
            )}
          ></Controller>
        </Grid2>
        <Grid2 xs={4}>
          <Controller
            name="mesto"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <TextField
                fullWidth
                sx={{ m: 1 }}
                id="mesto"
                label="Mesto odrazavanja"
                variant="outlined"
                {...field}
                error={Boolean(errors.mesto)}
                helperText={errors.mesto?.message}
              />
            )}
          ></Controller>
        </Grid2>
        <Grid2 xs={4}>
          <Controller
            name="osnovnaCena"
            control={control}
            defaultValue={0}
            render={({ field }) => (
              <TextField
                fullWidth
                sx={{ m: 1 }}
                id="osnovna-cena"
                label="Osnovna cena"
                variant="outlined"
                type="number"
                value={field.value}
                onChange={(e) => {
                  field.onChange(Number(e.target.value));
                }}
                error={Boolean(errors.osnovnaCena)}
                helperText={errors.osnovnaCena?.message}
              />
            )}
          ></Controller>
        </Grid2>
        <Grid2 xs={4}>
          <Controller
            name="tipSeminara"
            control={control}
            render={({ field, fieldState: { error } }) => {
              const { onChange } = field;
              return (
                <Autocomplete
                  fullWidth
                  sx={{ m: 1 }}
                  id="tip-seminara"
                  options={tipoviSeminara}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Tip Seminara"
                      error={!!error}
                      helperText={error?.message}
                    />
                  )}
                  onChange={(_event: any, newValue) => {
                    onChange(newValue);
                  }}
                />
              );
            }}
          ></Controller>
        </Grid2>
        <Grid2 xs={4}>
          <Controller
            control={control}
            name="datum"
            rules={{ required: true }}
            render={({ field, fieldState }) => (
              <FormControl fullWidth sx={{ m: 1 }}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    format="yyyy/MM/dd"
                    label="Datum odrzavanja"
                    disablePast
                    value={field.value}
                    onChange={(newValue) => {
                      field.onChange(newValue);
                      return newValue;
                    }}
                    slots={{
                      textField: ({ ...params }) => (
                        <TextField
                          {...params}
                          error={!!fieldState.invalid}
                          helperText={fieldState.error && "Datum odrzavanja is required"}
                        />
                      ),
                    }}
                  />
                </LocalizationProvider>
              </FormControl>
            )}
          ></Controller>
        </Grid2>
      </Grid2>
      <Button sx={{ m: 1 }} size="large" variant="contained" color="success" type="submit">
        Kreiraj novi seminar
      </Button>
    </Box>
  );
}
