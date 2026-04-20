import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import {
  calcSeminarStavkaSubtotal,
  formatMoney,
  isIzdavacPdvObveznik,
  type StavkaUslugaV2Form,
  type Valuta,
} from "ied-shared";
import { useMemo } from "react";
import { Controller, useWatch } from "react-hook-form";
import { useRacunV2Form } from "../../hooks/useRacunV2Form";

type Props = {
  stavkaIndex: number;
  onRemove: () => void;
};

/**
 * Editable card for a single `usluga` stavka. Always expanded — Phase 1
 * does not collapse stavke (decision: visual scanning > screen real estate
 * for invoices that typically have <5 stavke).
 *
 * **Field paths.** Every `Controller` `name` is built as
 * `stavke.${stavkaIndex}.<field>`. RHF's path types accept the template
 * literal cleanly; the discriminated-union widening on `field.value` is
 * harmless because `TextField` accepts unknown values via `value={...}`.
 *
 * **Subtotal scope.** Subtotal is computed via a card-local
 * `useWatch({ name: "stavke.${stavkaIndex}" })` rather than the page-level
 * `useRacunV2Calculations()`. The page-level hook subscribes to ALL stavke,
 * which would re-render every card on every keystroke in any card. The
 * card-local watch only fires when this specific stavka's subtree changes.
 * Same calculator function — no logic divergence.
 *
 * **`stopaPdv` visibility.** The per-stavka rate input is hidden when the
 * izdavac is not a PDV obveznik (ticket 5.2.5). Form value persists at the
 * snapshot from append time; calculator forces 0 internally regardless. If
 * the user later switches izdavac to a PDV obveznik, the rate is already
 * populated and the input reappears.
 *
 * **`jedinicaMere` is hardcoded** (ticket 5.2.6). The empty-stavka factory
 * writes `"Broj ucesnika"` into form state; this card intentionally does
 * NOT render a control for it. Value survives through to DOCX rendering.
 */
export function UslugaStavkaCard({ stavkaIndex, onRemove }: Props) {
  const { control } = useRacunV2Form();

  const izdavacRacuna = useWatch({ control, name: "izdavacRacuna" });
  const valuta = useWatch({ control, name: "valuta" }) as Valuta;
  const stavka = useWatch({ control, name: `stavke.${stavkaIndex}` });

  const pdvObveznik = isIzdavacPdvObveznik(izdavacRacuna);

  const subtotal = useMemo(
    // useWatch returns the discriminated-union element type; this card only
    // mounts for stavke whose tipStavke is "usluga" (StavkeSection dispatches
    // by tipStavke), so the cast is safe.
    () =>
      calcSeminarStavkaSubtotal(stavka as StavkaUslugaV2Form, { pdvObveznik }),
    [stavka, pdvObveznik],
  );

  const baseName = `stavke.${stavkaIndex}` as const;

  return (
    <Card variant="outlined">
      <CardHeader
        title={`Stavka ${stavkaIndex + 1} — Usluga`}
        slotProps={{
          title: {
            variant: "subtitle1",
          },
        }}
        action={
          <IconButton
            aria-label={`Obriši stavku ${stavkaIndex + 1}`}
            onClick={onRemove}
            size="small"
          >
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        }
      />
      <Divider />
      <CardContent>
        <Stack spacing={2.5}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name={`${baseName}.naziv`}
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    fullWidth
                    required
                    label="Naziv usluge"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message ?? " "}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Controller
                name={`${baseName}.datum`}
                control={control}
                render={({ field, fieldState }) => (
                  <DatePicker
                    label="Datum"
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

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Controller
                name={`${baseName}.lokacija`}
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Lokacija"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message ?? " "}
                  />
                )}
              />
            </Grid>
          </Grid>

          <FieldGroup label="Online">
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name={`${baseName}.onlineKolicina`}
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="number"
                      label="Broj učesnika"
                      slotProps={{ htmlInput: { min: 0 } }}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message ?? " "}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name={`${baseName}.onlineCena`}
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="number"
                      label="Cena po učesniku"
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
            </Grid>
          </FieldGroup>

          <FieldGroup label="Offline">
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name={`${baseName}.offlineKolicina`}
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="number"
                      label="Broj učesnika"
                      slotProps={{ htmlInput: { min: 0 } }}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message ?? " "}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name={`${baseName}.offlineCena`}
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="number"
                      label="Cena po učesniku"
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
            </Grid>
          </FieldGroup>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: pdvObveznik ? 6 : 12 }}>
              <Controller
                name={`${baseName}.popust`}
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="number"
                    label="Popust"
                    slotProps={{
                      htmlInput: { min: 0, max: 100, step: "0.01" },
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
            {pdvObveznik ? (
              <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                <Controller
                  name={`${baseName}.stopaPdv`}
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
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
          </Grid>

          <SubtotalStrip
            popustIznos={subtotal.popustIznos}
            poreskaOsnovica={subtotal.poreskaOsnovica}
            pdv={subtotal.pdv}
            ukupno={subtotal.ukupno}
            valuta={valuta}
          />
        </Stack>
      </CardContent>
    </Card>
  );
}

/**
 * Coerces RHF's loose form value (z.input for z.coerce.date is `unknown`)
 * into the `Date | null` shape MUI DatePicker expects. Strings (e.g. from
 * navigation prefill in Story 7.2) get parsed; invalid → null.
 */
const toDateOrNull = (value: unknown): Date | null => {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  if (typeof value === "string" && value !== "") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
};

function FieldGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Box>
      <Typography variant="overline" color="text.secondary" gutterBottom>
        {label}
      </Typography>
      {children}
    </Box>
  );
}

type SubtotalStripProps = {
  popustIznos: number;
  poreskaOsnovica: number;
  pdv: number;
  ukupno: number;
  valuta: Valuta;
};

function SubtotalStrip({
  popustIznos,
  poreskaOsnovica,
  pdv,
  ukupno,
  valuta,
}: SubtotalStripProps) {
  return (
    <Box
      sx={{
        bgcolor: "action.hover",
        borderRadius: 1,
        p: 1.5,
      }}
    >
      <Grid container spacing={2} alignItems="center">
        <SubtotalCell label="Popust" value={formatMoney(popustIznos, valuta)} />
        <SubtotalCell
          label="Poreska osnovica"
          value={formatMoney(poreskaOsnovica, valuta)}
        />
        <SubtotalCell label="PDV" value={formatMoney(pdv, valuta)} />
        <SubtotalCell
          label="Ukupno"
          value={formatMoney(ukupno, valuta)}
          emphasize
        />
      </Grid>
    </Box>
  );
}

function SubtotalCell({
  label,
  value,
  emphasize,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <Grid
      size={{ xs: 6, md: 3 }}
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
