import { Chip } from "@mui/material";
import { blue, green, grey, purple, red } from "@mui/material/colors";
import {
  IZDAVAC_RACUNA_LABELS,
  IzdavacRacuna,
  TIP_RACUNA_LABELS,
  TipRacuna,
} from "ied-shared";

const TIP_RACUNA_COLORS: Record<TipRacuna, string> = {
  [TipRacuna.PREDRACUN]: red[300],
  [TipRacuna.AVANSNI_RACUN]: green[200],
  [TipRacuna.KONACNI_RACUN]: blue[200],
  [TipRacuna.RACUN]: grey[400],
};

const IZDAVAC_RACUNA_COLORS: Record<IzdavacRacuna, string> = {
  [IzdavacRacuna.IED]: blue[500],
  [IzdavacRacuna.BS]: green[500],
  [IzdavacRacuna.PERMANENT]: purple[500],
};

const ColoredChip = ({ label, color }: { label: string; color?: string }) => (
  <Chip
    label={label}
    size="small"
    sx={color ? { bgcolor: color, color: "#fff" } : undefined}
  />
);

export const TipRacunaChip = ({ tip }: { tip: string }) => (
  <ColoredChip
    label={TIP_RACUNA_LABELS[tip as TipRacuna] ?? tip}
    color={TIP_RACUNA_COLORS[tip as TipRacuna]}
  />
);

export const IzdavacRacunaChip = ({ izdavac }: { izdavac: string }) => {
  // Older records may be stored in a different case.
  const key = izdavac?.toLowerCase() as IzdavacRacuna;
  return (
    <ColoredChip
      label={IZDAVAC_RACUNA_LABELS[key] ?? izdavac}
      color={IZDAVAC_RACUNA_COLORS[key]}
    />
  );
};
