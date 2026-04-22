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
 * Shared payment-terms section for racun types that carry `rokZaUplatu`.
 *
 * The form state keeps `rokZaUplatu` as `number | null`:
 * - `null` means "empty / not filled in yet"
 * - any number (including 0) is an intentional value
 *
 * This keeps the domain meaning clearer than a raw-string input model while
 * still letting the MUI field render blank on first paint.
 */
export function UsloviPlacanjaSection() {
  const { control } = useRacunV2Form();

  return (
    <Card variant="outlined">
      <CardHeader
        title="Uslovi plaćanja"
        subheader="Koliko dana primalac ima za uplatu."
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
                  value={field.value === null ? "" : field.value}
                  onChange={(event) => {
                    const raw = event.target.value;
                    if (raw === "") {
                      field.onChange(null);
                      return;
                    }

                    const nextValue = Number(raw);
                    field.onChange(Number.isNaN(nextValue) ? null : nextValue);
                  }}
                  onBlur={field.onBlur}
                  fullWidth
                  required
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
                  helperText={
                    fieldState.error?.message ??
                    "Broj dana do uplate. Dozvoljena vrednost je 0 ili više."
                  }
                />
              )}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
