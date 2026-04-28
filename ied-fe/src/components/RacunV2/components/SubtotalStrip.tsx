import { Box, Grid, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { formatMoney, type Valuta } from "ied-shared";

type SubtotalStripProps = {
  popustIznos: number;
  poreskaOsnovica: number;
  pdv: number;
  ukupno: number;
  valuta: Valuta;
  accentColor?: "primary" | "info" | "success" | "warning";
};

export function SubtotalStrip({
  popustIznos,
  poreskaOsnovica,
  pdv,
  ukupno,
  valuta,
  accentColor = "primary",
}: SubtotalStripProps) {
  return (
    <Box
      sx={{
        border: 1,
        borderColor: (theme) => alpha(theme.palette[accentColor].main, 0.16),
        bgcolor: (theme) => alpha(theme.palette[accentColor].main, 0.05),
        borderRadius: 2,
        p: 1.75,
      }}
    >
      <Grid container spacing={2} alignItems="center">
        <SubtotalCell
          label="Popust"
          value={formatMoney(popustIznos, valuta)}
          accentColor={accentColor}
        />
        <SubtotalCell
          label="Poreska osnovica"
          value={formatMoney(poreskaOsnovica, valuta)}
          accentColor={accentColor}
        />
        <SubtotalCell
          label="PDV"
          value={formatMoney(pdv, valuta)}
          accentColor={accentColor}
        />
        <SubtotalCell
          label="Ukupno"
          value={formatMoney(ukupno, valuta)}
          emphasize
          accentColor={accentColor}
        />
      </Grid>
    </Box>
  );
}

type SubtotalCellProps = {
  label: string;
  value: string;
  emphasize?: boolean;
  accentColor: "primary" | "info" | "success" | "warning";
};

function SubtotalCell({
  label,
  value,
  emphasize,
  accentColor,
}: SubtotalCellProps) {
  return (
    <Grid
      size={{ xs: 6, md: 3 }}
      sx={
        emphasize
          ? {
              borderLeft: { md: 2.5 },
              borderColor: { md: `${accentColor}.main` },
              pl: { md: 2.25 },
            }
          : undefined
      }
    >
      <Typography
        variant="caption"
        display="block"
        sx={{
          color: emphasize ? `${accentColor}.main` : "text.secondary",
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
          color: emphasize ? `${accentColor}.main` : "text.primary",
          fontWeight: emphasize ? 700 : 500,
          lineHeight: emphasize ? 1.2 : undefined,
        }}
      >
        {value}
      </Typography>
    </Grid>
  );
}
