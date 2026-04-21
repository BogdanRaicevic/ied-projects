import {
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  InputAdornment,
  TextField,
} from "@mui/material";
import { Controller } from "react-hook-form";
import { useRacunV2Form } from "../hooks/useRacunV2Form";

/**
 * Payment-terms section, shared by all `tipRacuna` branches that carry
 * `rokZaUplatu` — currently Predracun, Konacni racun, Racun. (Avansni racun
 * is the exception: it has `datumUplateAvansa` instead, edited inside its
 * own `AvansAmountsSection`.)
 *
 * Currently a single field — `rokZaUplatu` (number of days the client has
 * to pay) — but kept as a standalone section so additional commercial-terms
 * fields (e.g. late-payment penalties, discount-on-early-payment) can land
 * here without growing other sections.
 *
 * Mounting is the layout's responsibility (`PredracunLayout`,
 * `KonacniLayout`, `RacunLayout`). The shared rule lives in
 * `tipRacunaHasRokZaUplatu` — sections themselves are dumb and just render
 * the input; layouts decide whether to mount them.
 *
 * Read-only mirror of the value lives in `SummaryPanel` under "Ukupna
 * naknada" so the user can see the agreed term while typing in stavke
 * without scrolling. The input here is the source of truth; the Pregled
 * display reads from RHF state.
 */
export function UsloviPlacanjaSection() {
  const { control } = useRacunV2Form();

  return (
    <Card variant="outlined">
      <CardHeader
        title="Uslovi plaćanja"
        subheader="Rok za uplatu i ostali komercijalni uslovi."
      />
      <Divider />
      <CardContent>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Controller
              name="rokZaUplatu"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  value={field.value ?? 0}
                  fullWidth
                  type="number"
                  label="Rok za uplatu"
                  slotProps={{
                    htmlInput: { min: 0, step: 1 },
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">dana</InputAdornment>
                      ),
                    },
                  }}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message ?? " "}
                />
              )}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
