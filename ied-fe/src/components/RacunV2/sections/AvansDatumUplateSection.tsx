import { Card, CardContent, CardHeader, Divider, Grid } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Controller } from "react-hook-form";
import { useRacunV2Form } from "../hooks/useRacunV2Form";
import { toDateOrNull } from "../utils/date";

/**
 * Avansni-only metadata section.
 *
 * Avans amounts now live on each stavka (`stavke[].avansBezPdv` +
 * `stavke[].stopaPdv`) so the form can mirror the predracun add-stavka flow.
 * This section keeps only the avansni-specific payment date that replaces
 * `UsloviPlacanjaSection` / `rokZaUplatu`.
 */
export function AvansDatumUplateSection() {
  const { control } = useRacunV2Form();

  return (
    <Card variant="outlined">
      <CardHeader
        title="Datum uplate avansa"
        subheader="Datum kada je avans stvarno uplaćen."
      />
      <Divider />
      <CardContent>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="datumUplateAvansa"
              control={control}
              render={({ field, fieldState }) => (
                <DatePicker
                  label="Datum uplate avansa"
                  format="yyyy.MM.dd"
                  value={toDateOrNull(field.value)}
                  onChange={(next) => field.onChange(next)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      onBlur: field.onBlur,
                      error: !!fieldState.error,
                      helperText: fieldState.error?.message ?? " ",
                    },
                  }}
                />
              )}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
