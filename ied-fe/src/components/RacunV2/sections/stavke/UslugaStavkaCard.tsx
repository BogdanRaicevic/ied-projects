import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import {
  calcSeminarStavkaSubtotal,
  isIzdavacPdvObveznik,
  type StavkaUslugaV2Form,
  type Valuta,
} from "ied-shared";
import { useMemo } from "react";
import { Controller, useWatch } from "react-hook-form";
import { SubtotalStrip } from "../../components/SubtotalStrip";
import { useRacunV2Form } from "../../hooks/useRacunV2Form";
import { toDateOrNull } from "../../utils/date";

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
    <Card
      variant="outlined"
      sx={{
        overflow: "hidden",
        borderLeft: 4,
        borderColor: "info.main",
        boxShadow: "0 1px 2px rgba(15, 23, 42, 0.06)",
      }}
    >
      <CardHeader
        title={
          <Stack spacing={1}>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              flexWrap="wrap"
            >
              <Chip label="Usluga" color="info" variant="filled" />
              <Typography
                variant="overline"
                sx={{
                  color: "info.main",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                }}
              >
                Stavka #{stavkaIndex + 1}
              </Typography>
            </Stack>
            <Typography variant="subtitle1" fontWeight={700}>
              {stavka?.naziv?.trim() || "Nova usluga"}
            </Typography>
          </Stack>
        }
        slotProps={{
          title: {
            component: "div",
          },
        }}
        sx={{
          bgcolor: (theme) => alpha(theme.palette.info.main, 0.05),
          "& .MuiCardHeader-action": {
            alignSelf: "center",
          },
        }}
        action={
          <IconButton
            aria-label={`Obriši stavku ${stavkaIndex + 1}`}
            onClick={onRemove}
            size="small"
            color="error"
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

          <Box
            sx={{
              bgcolor: (theme) => alpha(theme.palette.info.main, 0.04),
              borderRadius: 2,
              px: 2,
              py: 1.5,
            }}
          >
            <Typography variant="overline" color="text.secondary" gutterBottom>
              Online
            </Typography>
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
          </Box>

          <Box
            sx={{
              bgcolor: (theme) => alpha(theme.palette.info.main, 0.04),
              borderRadius: 2,
              px: 2,
              py: 1.5,
            }}
          >
            <Typography variant="overline" color="text.secondary" gutterBottom>
              Offline
            </Typography>
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
          </Box>

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
            accentColor="info"
          />
        </Stack>
      </CardContent>
    </Card>
  );
}
