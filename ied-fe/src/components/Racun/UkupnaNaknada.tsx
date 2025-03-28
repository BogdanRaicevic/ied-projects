import { Typography, TextField } from "@mui/material";
import { Box } from "@mui/system";
import type { Racun } from "./types";

interface UkupnaNaknadaProps {
  racun: Partial<Racun>;
  onRacunChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const UkupnaNaknada = ({ racun, onRacunChange }: UkupnaNaknadaProps) => {
  return (
    <Box>
      <Box>
        <Typography variant="h6" sx={{ mr: 1 }}>
          Ukupna naknada po svim stavkama:{" "}
          {(Number(racun.onlineUkupnaNaknada) + Number(racun.offlineUkupnaNaknada)).toLocaleString(
            "sr-RS",
            {
              style: "currency",
              currency: "RSD",
              minimumFractionDigits: 2,
            }
          )}
        </Typography>
        <Typography variant="h6" sx={{ mr: 1 }}>
          Ukupni PDV po svim stavkama:{" "}
          {(Number(racun.pdvOnline) + Number(racun.pdvOffline)).toLocaleString("sr-RS", {
            style: "currency",
            currency: "RSD",
            minimumFractionDigits: 2,
          })}
        </Typography>
      </Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "flex-start",
        }}
      >
        <Typography variant="h6" sx={{ mr: 1 }}>
          Rok za uplatu
        </Typography>
        <TextField
          name="rokZaUplatu"
          variant="filled"
          value={racun.rokZaUplatu}
          sx={{ maxWidth: 60 }}
          onChange={(e) => {
            console.log(e.target.value);
            onRacunChange(e);
          }}
        />
        <Typography variant="h6" sx={{ ml: 1 }}>
          dana
        </Typography>
      </Box>
    </Box>
  );
};
