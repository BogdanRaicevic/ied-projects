import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import {
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
} from "@mui/material";
import {
  calcProizvodStavkaSubtotal,
  isIzdavacPdvObveznik,
  type StavkaProizvodV2Form,
  type Valuta,
} from "ied-shared";
import { useMemo } from "react";
import { Controller, useWatch } from "react-hook-form";
import { SubtotalStrip } from "../../components/SubtotalStrip";
import { useRacunV2Form } from "../../hooks/useRacunV2Form";

type Props = {
  stavkaIndex: number;
  onRemove: () => void;
};

/**
 * Editable card for a single `proizvod` stavka. Slimmer than UslugaStavkaCard
 * by design: no `datum`/`lokacija`, no online/offline split — products are a
 * single `kolicina × cena` line.
 *
 * Mirrors UslugaStavkaCard's patterns:
 * - Card-local `useWatch` scope so only the edited card re-renders (the
 *   page-level calculator subscription would re-render every card on every
 *   keystroke in any card).
 * - `Controller` per field with consistent error/helperText rendering.
 * - Conditional `stopaPdv` input: hidden when izdavac is not a PDV obveznik;
 *   form value persists at append-time snapshot, calculator forces 0 anyway.
 *
 * Diverges in two places:
 * - `jedinicaMere` is an editable `TextField` (ticket 5.3.2) — usluga
 *   hardcodes "Broj ucesnika"; proizvod commonly varies (kom, kg, l, primerak,
 *   licenca…), so the user controls it. Default "Broj primeraka" is set by
 *   the empty-stavka factory.
 * - Subtotal uses `calcProizvodStavkaSubtotal` (single line) instead of
 *   `calcSeminarStavkaSubtotal` (online + offline). Same `SubtotalStrip`
 *   display component — the strip is calculator-agnostic.
 */
export function ProizvodStavkaCard({ stavkaIndex, onRemove }: Props) {
  const { control } = useRacunV2Form();

  const izdavacRacuna = useWatch({ control, name: "izdavacRacuna" });
  const valuta = useWatch({ control, name: "valuta" }) as Valuta;
  const stavka = useWatch({ control, name: `stavke.${stavkaIndex}` });

  const pdvObveznik = isIzdavacPdvObveznik(izdavacRacuna);

  const subtotal = useMemo(
    // useWatch returns the discriminated-union element type; this card only
    // mounts for stavke whose tipStavke is "proizvod" (StavkeSection
    // dispatches by tipStavke), so the cast is safe.
    () =>
      calcProizvodStavkaSubtotal(stavka as StavkaProizvodV2Form, {
        pdvObveznik,
      }),
    [stavka, pdvObveznik],
  );

  const baseName = `stavke.${stavkaIndex}` as const;

  return (
    <Card variant="outlined">
      <CardHeader
        title={`Stavka ${stavkaIndex + 1} — Proizvod`}
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
            <Grid size={{ xs: 12, md: 8 }}>
              <Controller
                name={`${baseName}.naziv`}
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    fullWidth
                    required
                    label="Naziv proizvoda"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message ?? " "}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Controller
                name={`${baseName}.jedinicaMere`}
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Jedinica mere"
                    placeholder="Broj primeraka"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message ?? " "}
                  />
                )}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name={`${baseName}.kolicina`}
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="number"
                    label="Količina"
                    slotProps={{ htmlInput: { min: 0 } }}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message ?? " "}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name={`${baseName}.cena`}
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="number"
                    label="Cena"
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
