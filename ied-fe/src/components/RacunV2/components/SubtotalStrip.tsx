import { Box, Grid, Typography } from "@mui/material";
import { formatMoney, type Valuta } from "ied-shared";

type SubtotalStripProps = {
  popustIznos: number;
  poreskaOsnovica: number;
  pdv: number;
  ukupno: number;
  valuta: Valuta;
};

export function SubtotalStrip({
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

type SubtotalCellProps = {
  label: string;
  value: string;
  emphasize?: boolean;
};

function SubtotalCell({ label, value, emphasize }: SubtotalCellProps) {
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
