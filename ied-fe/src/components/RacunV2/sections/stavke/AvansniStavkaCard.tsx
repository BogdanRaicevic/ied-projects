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
import {
  calcAvansniStavkaSubtotal,
  formatMoney,
  isIzdavacPdvObveznik,
  type StavkaRacunaV2Form,
  type Valuta,
} from "ied-shared";
import { useMemo } from "react";
import { Controller, useWatch } from "react-hook-form";
import { useRacunV2Form } from "../../hooks/useRacunV2Form";

type Props = {
  stavkaIndex: number;
  onRemove: () => void;
};

export function AvansniStavkaCard({ stavkaIndex, onRemove }: Props) {
  const { control } = useRacunV2Form();

  const izdavacRacuna = useWatch({ control, name: "izdavacRacuna" });
  const valuta = useWatch({ control, name: "valuta" }) as Valuta;
  const stavka = useWatch({ control, name: `stavke.${stavkaIndex}` });

  const pdvObveznik = isIzdavacPdvObveznik(izdavacRacuna);
  const isUsluga = stavka?.tipStavke === "usluga";
  const accentColor = isUsluga ? "info" : "success";
  const typeLabel = isUsluga ? "Usluga" : "Proizvod";

  // calcAvansniStavkaSubtotal only reads `avansBezPdv` + `stopaPdv` from the
  // stavka — both fields exist on every member of the discriminated union, so
  // the cast to the union form type is safe regardless of which `tipStavke`
  // the user added. (Mirrors the cast pattern in UslugaStavkaCard /
  // ProizvodStavkaCard, where the card narrows by `tipStavke` instead.)
  const subtotal = useMemo(
    () =>
      calcAvansniStavkaSubtotal(stavka as StavkaRacunaV2Form, {
        pdvObveznik,
      }),
    [stavka, pdvObveznik],
  );

  const baseName = `stavke.${stavkaIndex}` as const;

  return (
    <Card
      variant="outlined"
      sx={{
        overflow: "hidden",
        borderLeft: 4,
        borderColor: `${accentColor}.main`,
        boxShadow: "0 1px 2px rgba(15, 23, 42, 0.06)",
      }}
    >
      <CardHeader
        title={
          <Stack spacing={1}>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <Chip label={typeLabel} color={accentColor} variant="filled" />
              <Typography
                variant="overline"
                sx={{
                  color: `${accentColor}.main`,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                }}
              >
                Stavka #{stavkaIndex + 1}
              </Typography>
            </Stack>
            <Typography variant="subtitle1" fontWeight={700}>
              {stavka?.naziv?.trim() || `Nova ${isUsluga ? "usluga" : "stavka"}`}
            </Typography>
          </Stack>
        }
        slotProps={{
          title: {
            component: "div",
          },
        }}
        sx={{
          bgcolor: (theme) => alpha(theme.palette[accentColor].main, 0.05),
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
                    label={isUsluga ? "Naziv usluge" : "Naziv proizvoda"}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message ?? " "}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: pdvObveznik ? 3 : 6 }}>
              <Controller
                name={`${baseName}.avansBezPdv`}
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
                          <InputAdornment position="end">{valuta}</InputAdornment>
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
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Controller
                  name={`${baseName}.stopaPdv`}
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
          </Grid>

          <AvansniDerivedStrip
            avansBezPdv={subtotal.poreskaOsnovica}
            pdv={subtotal.pdv}
            uplacenAvans={subtotal.ukupno}
            valuta={valuta}
            pdvObveznik={pdvObveznik}
          />
        </Stack>
      </CardContent>
    </Card>
  );
}

type AvansniDerivedStripProps = {
  avansBezPdv: number;
  pdv: number;
  uplacenAvans: number;
  valuta: Valuta;
  pdvObveznik: boolean;
};

function AvansniDerivedStrip({
  avansBezPdv,
  pdv,
  uplacenAvans,
  valuta,
  pdvObveznik,
}: AvansniDerivedStripProps) {
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
            label="Iznos PDV-a"
            value={formatMoney(pdv, valuta)}
            mdSize={4}
          />
        ) : null}
        <DerivedCell
          label="Uplaćen avans"
          value={formatMoney(uplacenAvans, valuta)}
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
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        {label}
      </Typography>
      <Typography variant={emphasize ? "h6" : "body1"} fontWeight={700}>
        {value}
      </Typography>
    </Grid>
  );
}
