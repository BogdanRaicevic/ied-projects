import { Box, Divider, TextField, Typography } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { AvansSection } from "./components/AvansSection";
import { PrimalacRacunaSection } from "./components/PrimalacRacunaSection";
import { useRacunStore } from "./store/useRacunStore";

export const CreateAvansForm = () => {
  const racunData = useRacunStore((state) => state.racunData);
  const updateField = useRacunStore((state) => state.updateField);

  const pozivNaBroj = racunData.pozivNaBroj && (
    <TextField
      name="pozivNaBroj"
      placeholder="Poziv na broj"
      value={racunData.pozivNaBroj || ""}
      size="small"
      sx={{ width: "150px" }}
      disabled
      onChange={(e) => updateField("pozivNaBroj", e.target.value)}
    />
  );

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 3,
          gap: 2,
        }}
      >
        <Typography variant="h4">Avansni račun</Typography>
        {pozivNaBroj}
      </Box>
      <PrimalacRacunaSection />
      <Divider sx={{ mt: 3, mb: 3 }} />
      <AvansSection />
      <DatePicker
        sx={{ mt: 3 }}
        label="Datum uplate avansa"
        format="yyyy.MM.dd"
        value={racunData.datumUplateAvansa || new Date()}
        onChange={(e) => updateField("datumUplateAvansa", e || new Date())}
      ></DatePicker>
    </Box>
  );
};
