import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import {
  calcAvansDerived,
  formatMoney,
  isIzdavacPdvObveznik,
  type Valuta,
} from "ied-shared";
import { useMemo } from "react";
import { Controller, useWatch } from "react-hook-form";
import { useRacunV2Form } from "../hooks/useRacunV2Form";
import { toDateOrNull } from "../utils/date";

/**
 * Avansni-only section: the user enters `avansBezPdv` (the avans amount the
 * client paid before PDV) and a PDV rate; the section displays the derived
 * `avansPdv` and the total `avans`. Also collects `datumUplateAvansa`
 * (when the avans was actually paid).
 *
 * **Why not reuse `SubtotalStrip`?** That strip is built around stavka
 * subtotals (Popust → Poreska osnovica → PDV → UKUPNO). For avansni the
 * shape is different — there's no "Popust" cell, and the "base" is the
 * user-entered `avansBezPdv` rather than a derived `poreskaOsnovica`. A
 * small inline 3-cell display matches the same emphasis-on-total visual
 * grammar without bending the strip's contract.
 *
 * **`stopaPdvAvansni` visibility.** Hidden when the izdavac is not a PDV
 * obveznik — same pattern as per-stavka `stopaPdv` in `UslugaStavkaCard`.
 * The form value persists; the calculator forces 0 internally so totals
 * stay correct regardless of UI state.
 *
 * **Derived calculator.** Subtotal computed via card-local
 * `calcAvansDerived` against the locally-watched `avansBezPdv` +
 * `stopaPdvAvansni`. The page-level `useRacunV2Calculations` runs the same
 * function for the SummaryPanel totals — no logic divergence.
 *
 * Mounted only by `AvansniLayout` — the schema fields exist solely on the
 * avansni branch of the discriminated union.
 */
export function AvansAmountsSection() {
  const { control } = useRacunV2Form();

  const izdavacRacuna = useWatch({ control, name: "izdavacRacuna" });
  const valuta = useWatch({ control, name: "valuta" }) as Valuta;
  const avansBezPdv = useWatch({
    control,
    name: "avansBezPdv",
    defaultValue: 0,
  });
  const stopaPdvAvansni = useWatch({
    control,
    name: "stopaPdvAvansni",
    defaultValue: 20,
  });

  const pdvObveznik = isIzdavacPdvObveznik(izdavacRacuna);

  const derived = useMemo(
    () => calcAvansDerived(avansBezPdv, stopaPdvAvansni, { pdvObveznik }),
    [avansBezPdv, stopaPdvAvansni, pdvObveznik],
  );

  return (
    <Card variant="outlined">
      <CardHeader
        title="Avans"
        subheader="Iznos avansa, PDV stopa i datum uplate."
      />
      <Divider />
      <CardContent>
        <Stack spacing={2.5}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: pdvObveznik ? 4 : 6 }}>
              <Controller
                name="avansBezPdv"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    value={field.value ?? 0}
                    fullWidth
                    required
                    type="number"
                    label="Avans bez PDV-a"
                    slotProps={{
                      htmlInput: { min: 0, step: "0.01" },
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            {valuta}
                          </InputAdornment>
                        ),
                      },
                    }}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message ?? " "}
                  />
                )}
              />
            </Grid>

            {pdvObveznik ? (
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Controller
                  name="stopaPdvAvansni"
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      value={field.value ?? 20}
                      fullWidth
                      type="number"
                      label="Stopa PDV-a"
                      slotProps={{
                        htmlInput: { min: 0, max: 50, step: "0.01" },
                        input: {
                          endAdornment: (
                            <InputAdornment position="end">%</InputAdornment>
                          ),
                        },
                      }}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message ?? " "}
                    />
                  )}
                />
              </Grid>
            ) : null}

            <Grid size={{ xs: 12, sm: 6, md: pdvObveznik ? 4 : 6 }}>
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

          <AvansDerivedStrip
            avansBezPdv={derived.avansBezPdv}
            avansPdv={derived.avansPdv}
            avans={derived.avans}
            valuta={valuta}
            pdvObveznik={pdvObveznik}
          />
        </Stack>
      </CardContent>
    </Card>
  );
}

type AvansDerivedStripProps = {
  avansBezPdv: number;
  avansPdv: number;
  avans: number;
  valuta: Valuta;
  pdvObveznik: boolean;
};

/**
 * Inline derived-totals strip for the avansni section. Mirrors the visual
 * grammar of `SubtotalStrip` (caption label + value, emphasized UKUPNO
 * cell with primary-color border treatment) but with avansni-specific
 * cells: Avans bez PDV-a, PDV avansa, UKUPAN AVANS.
 *
 * When the izdavac is not a PDV obveznik, the PDV cell is hidden and the
 * remaining two cells expand to fill — same approach as the per-stavka
 * `stopaPdv` pattern.
 */
function AvansDerivedStrip({
  avansBezPdv,
  avansPdv,
  avans,
  valuta,
  pdvObveznik,
}: AvansDerivedStripProps) {
  return (
    <Box
      sx={{
        bgcolor: "action.hover",
        borderRadius: 1,
        p: 1.5,
      }}
    >
      <Grid container spacing={2} alignItems="center">
        <DerivedCell
          label="Avans bez PDV-a"
          value={formatMoney(avansBezPdv, valuta)}
          mdSize={pdvObveznik ? 4 : 6}
        />
        {pdvObveznik ? (
          <DerivedCell
            label="PDV avansa"
            value={formatMoney(avansPdv, valuta)}
            mdSize={4}
          />
        ) : null}
        <DerivedCell
          label="Ukupan avans"
          value={formatMoney(avans, valuta)}
          mdSize={pdvObveznik ? 4 : 6}
          emphasize
        />
      </Grid>
    </Box>
  );
}

type DerivedCellProps = {
  label: string;
  value: string;
  mdSize: number;
  emphasize?: boolean;
};

function DerivedCell({ label, value, mdSize, emphasize }: DerivedCellProps) {
  return (
    <Grid
      size={{ xs: 6, md: mdSize }}
      sx={
        emphasize
          ? {
              borderLeft: { md: 2 },
              borderColor: { md: "primary.main" },
              pl: { md: 2 },
            }
          : undefined
      }
    >
      <Typography
        variant="caption"
        display="block"
        sx={{
          color: emphasize ? "primary.main" : "text.secondary",
          fontWeight: emphasize ? 600 : 400,
          textTransform: emphasize ? "uppercase" : "none",
          letterSpacing: emphasize ? "0.08em" : "normal",
        }}
      >
        {label}
      </Typography>
      <Typography
        variant={emphasize ? "h6" : "body2"}
        sx={{
          color: emphasize ? "primary.main" : "text.primary",
          fontWeight: emphasize ? 700 : 500,
          lineHeight: emphasize ? 1.2 : undefined,
        }}
      >
        {value}
      </Typography>
    </Grid>
  );
}
