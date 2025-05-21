import { Typography, TextField } from "@mui/material";
import { Box } from "@mui/system";
import { formatToRSDNumber } from "../../utils/helpers";
import { useRacunStore } from "./store/useRacunStore";
import { IzdavacRacuna, TipRacuna } from "@ied-shared/index";

export const UkupnaNaknada = () => {
  const racunData = useRacunStore((state) => state.racunData);
  const updateField = useRacunStore((state) => state.updateField);
  const updateNestedField = useRacunStore((state) => state.updateNestedField);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value === "" ? 0 : Number(e.target.value);
    updateField("rokZaUplatu", value);
  };

  return (
    <Box>
      <Box>
        <Typography variant="h6" sx={{ mr: 1 }}>
          Ukupna naknada po svim stavkama:{" "}
          {formatToRSDNumber(racunData.calculations.ukupnaNaknada ?? 0)}
        </Typography>
        {racunData.izdavacRacuna !== IzdavacRacuna.PERMANENT && (
          <Typography variant="h6" sx={{ mr: 1 }}>
            Ukupni PDV po svim stavkama: {formatToRSDNumber(racunData.calculations.ukupanPdv ?? 0)}
          </Typography>
        )}
      </Box>
      {racunData.tipRacuna === TipRacuna.PREDRACUN && (
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
            label="Rok za uplatu"
            type="number"
            name="rokZaUplatu"
            variant="filled"
            value={racunData.rokZaUplatu || 0}
            sx={{ maxWidth: 100 }}
            onChange={(e) => {
              handleChange(e);
            }}
          />
          <Typography variant="h6" sx={{ ml: 1 }}>
            dana
          </Typography>
        </Box>
      )}
      {racunData.tipRacuna === TipRacuna.RACUN && (
        <Box sx={{ mt: 2 }}>
          <TextField
            placeholder="Iznos uplaćen na račun"
            label="Iznos uplaćen na račun"
            type="number"
            name="placeno"
            variant="filled"
            value={racunData.calculations.placeno || 0}
            onChange={(e) => {
              updateNestedField(
                "calculations.placeno",
                e.target.value === "" ? 0 : Number(e.target.value)
              );
            }}
          ></TextField>
        </Box>
      )}
    </Box>
  );
};
