import {
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  TextField,
} from "@mui/material";
import { Controller } from "react-hook-form";
import { useRacunV2Form } from "../hooks/useRacunV2Form";

/**
 * Linked-avansni section for konacni racun. Single text input that holds the
 * `pozivNaBroj` of the avansni račun this konacni links to. Schema marks
 * the field required at the Zod layer (`linkedPozivNaBroj.min(1)`) and
 * Pregled surfaces the validation error.
 *
 * Phase 1 (today): plain text input. The on-blur callback console.log's
 * the value as a TODO marker — no real lookup yet.
 *
 * Phase 3: this section grows a debounced `getRacunByPozivNaBrojAndIzdavac`
 * lookup (the V1 API already exists), wires the resolved avans amounts into
 * the calculator via `extras.konacniDeduction`, surfaces a "linked: <naziv
 * primaoca>" confirmation, and adds an inline error for unresolved /
 * mismatched-izdavac inputs. The Pregled "− Avans" line is already wired to
 * `totals.odbitak`, so flipping the deduction from 0 → real is a single-call
 * change in `useRacunV2Calculations`.
 *
 * V1 parity: this is the V2 equivalent of V1's `AvansSection.tsx`'s "poziv
 * na broj avansnog računa" field. V1 stores the resolved avans amounts in
 * the same store slice as the rest of the racun; V2 will keep them in a
 * dedicated query/state outside form state (form state holds only what the
 * user authored).
 */
export function LinkedAvansniSection() {
  const { control } = useRacunV2Form();

  return (
    <Card variant="outlined">
      <CardHeader
        title="Povezani avansni račun"
        subheader="Poziv na broj avansnog računa koji se zatvara ovim konačnim."
      />
      <Divider />
      <CardContent>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 8, md: 6 }}>
            <Controller
              name="linkedPozivNaBroj"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  value={field.value ?? ""}
                  onBlur={(event) => {
                    field.onBlur();
                    const value = event.target.value.trim();
                    if (value.length > 0) {
                      // TODO(Phase 3): debounced getRacunByPozivNaBrojAndIzdavac
                      // lookup; on success, write the resolved deduction into
                      // useRacunV2Calculations via extras.konacniDeduction.
                      console.log(
                        "[RacunV2] linked avansni lookup TODO (Phase 3):",
                        value,
                      );
                    }
                  }}
                  fullWidth
                  label="Poziv na broj avansnog računa"
                  placeholder="npr. 12345678"
                  error={!!fieldState.error}
                  helperText={
                    fieldState.error?.message ??
                    "Faza 3: automatska validacija i oduzimanje avansa iz ukupne naknade."
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
