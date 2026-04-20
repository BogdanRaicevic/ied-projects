import {
  Alert,
  Autocomplete,
  Card,
  CardContent,
  CardHeader,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import {
  IZDAVAC_RACUNA_LABELS,
  IzdavacRacuna,
  type IzdavacRacunaOption,
  isIzdavacPdvObveznik,
  VALUTA_LABELS,
  VALUTA_VALUES,
} from "ied-shared";
import { Controller, useWatch } from "react-hook-form";
import { useFetchIzdavaciRacuna } from "../../../hooks/useFetchData";
import { useRacunV2Form } from "../hooks/useRacunV2Form";

const getTekuciRacuniOptions = (
  izdavaci: IzdavacRacunaOption[] | undefined,
  selectedIzdavac: IzdavacRacuna,
) => {
  return (
    izdavaci?.find((option) => option.id === selectedIzdavac)?.tekuciRacuni ??
    []
  );
};

export function IzdavacRacunaSection() {
  const { control, setValue } = useRacunV2Form();
  const selectedIzdavac = useWatch({
    control,
    name: "izdavacRacuna",
    defaultValue: IzdavacRacuna.IED,
  });

  const { data: izdavaciRacuna, isLoading, isError } = useFetchIzdavaciRacuna();
  const pdvObveznik = isIzdavacPdvObveznik(selectedIzdavac);
  const tekuciRacuniOptions = getTekuciRacuniOptions(
    izdavaciRacuna,
    selectedIzdavac,
  );

  return (
    <Card variant="outlined">
      <CardHeader
        title="Izdavac racuna"
        subheader="Osnovni podaci o izdavaocu, tekucem racunu i valuti prikaza."
      />
      <Divider />
      <CardContent>
        <Stack spacing={2.5}>
          {isError ? (
            <Alert severity="error">
              Greska pri ucitavanju izdavalaca racuna. Pokusajte ponovo.
            </Alert>
          ) : null}

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Controller
                name="izdavacRacuna"
                control={control}
                render={({ field, fieldState }) => (
                  <FormControl fullWidth error={!!fieldState.error}>
                    <InputLabel id="racun-v2-izdavac-label">
                      Izdavac racuna
                    </InputLabel>
                    <Select
                      {...field}
                      labelId="racun-v2-izdavac-label"
                      label="Izdavac racuna"
                      onChange={(event) => {
                        const nextValue = event.target.value as IzdavacRacuna;
                        field.onChange(nextValue);
                        setValue("tekuciRacun", "", {
                          shouldDirty: true,
                          shouldTouch: true,
                          shouldValidate: true,
                        });
                      }}
                    >
                      {Object.values(IzdavacRacuna).map((value) => (
                        <MenuItem key={value} value={value}>
                          {IZDAVAC_RACUNA_LABELS[value]}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>
                      {fieldState.error?.message ??
                        "Promena izdavaoca resetuje tekuci racun."}
                    </FormHelperText>
                  </FormControl>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Controller
                name="tekuciRacun"
                control={control}
                render={({ field, fieldState }) => (
                  <Autocomplete
                    loading={isLoading}
                    options={tekuciRacuniOptions}
                    value={field.value || null}
                    onChange={(_event, newValue) => {
                      field.onChange(newValue ?? "");
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Tekuci racun"
                        error={!!fieldState.error}
                        helperText={
                          fieldState.error?.message ??
                          "Lista dolazi iz postojeceg V1 read-only endpointa."
                        }
                      />
                    )}
                    noOptionsText={
                      isLoading
                        ? "Ucitavanje..."
                        : "Nema tekucih racuna za izabranog izdavaoca"
                    }
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Controller
                name="valuta"
                control={control}
                render={({ field, fieldState }) => (
                  <FormControl fullWidth error={!!fieldState.error}>
                    <InputLabel id="racun-v2-valuta-label">Valuta</InputLabel>
                    <Select
                      {...field}
                      labelId="racun-v2-valuta-label"
                      label="Valuta"
                    >
                      {VALUTA_VALUES.map((value) => (
                        <MenuItem key={value} value={value}>
                          {VALUTA_LABELS[value]}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>
                      {fieldState.error?.message ??
                        "EUR je trenutno samo vizuelni scaffold do Phase 6."}
                    </FormHelperText>
                  </FormControl>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 8 }}>
              <Controller
                name="pozivNaBroj"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    fullWidth
                    required
                    label="Poziv na broj"
                    error={!!fieldState.error}
                    helperText={
                      fieldState.error?.message ??
                      "Phase 1: rucni unos. Automatsko generisanje dolazi u Phase 2."
                    }
                  />
                )}
              />
            </Grid>

            {pdvObveznik ? (
              <Grid size={{ xs: 12, md: 4 }}>
                <Controller
                  name="defaultStopaPdv"
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="number"
                      label="Podrazumevana stopa PDV-a (za nove stavke)"
                      error={!!fieldState.error}
                      helperText={
                        fieldState.error?.message ??
                        "Menja samo podrazumevanu vrednost za nove stavke."
                      }
                      slotProps={{
                        htmlInput: {
                          min: 0,
                          step: 1,
                        },
                      }}
                    />
                  )}
                />
              </Grid>
            ) : (
              <Grid size={{ xs: 12 }}>
                <Alert severity="info">
                  Izabrani izdavac nije PDV obveznik. Podrazumevana stopa PDV-a
                  je skrivena, a kalkulatori interno forsiraju 0%.
                </Alert>
              </Grid>
            )}
          </Grid>
        </Stack>
      </CardContent>
    </Card>
  );
}
