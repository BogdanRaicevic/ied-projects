import { Divider, Typography, TextField, Box } from "@mui/material";
import { PrimalacRacunaSection } from "./components/PrimalacRacunaSection";
import { OfflinePrisustvaSection } from "./components/OfflinePrisustvaSection";
import { OnlinePrisustvaSection } from "./components/OnlinePrisustvaSection";
import { UkupnaNaknada } from "./UkupnaNaknada";
import { useRacunStore } from "./store/useRacunStore";

export const CreateRacunForm = () => {
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
        <Typography variant="h4">Konačni račun</Typography>
        {pozivNaBroj}
      </Box>
      <PrimalacRacunaSection />
      <Divider sx={{ mt: 3, mb: 3 }} />
      <OnlinePrisustvaSection />
      <OfflinePrisustvaSection />
      <UkupnaNaknada />
      <Divider sx={{ mt: 3 }} />
    </Box>
  );
};
