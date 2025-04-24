import { Grid2, Divider, Typography, TextField, Box } from "@mui/material";
import { PrimalacRacunaSection } from "./components/PrimalacRacunaSection";
import { OnlinePrisustvaSection } from "./components/OnlinePrisustvaSection";
import { OfflinePrisustvaSection } from "./components/OfflinePrisustvaSection";
import { UkupnaNaknada } from "./UkupnaNaknada";
import { useRacunStore } from "./store/useRacunStore";

export const CreatePredracunForm = () => {
  const racunData = useRacunStore((state) => state.racunData);
  const updateField = useRacunStore((state) => state.updateField);

  return (
    <Grid2 container>
      <Grid2 size={12}>
        <Box
          sx={{ display: "flex", alignItems: "center", justifyContent: "center", mb: 3, gap: 2 }}
        >
          <Typography variant="h4">Predračun</Typography>
          <TextField
            name="pozivNaBroj"
            placeholder="Poziv na broj"
            value={racunData.pozivNaBroj || ""}
            size="small"
            sx={{ width: "150px" }}
            onChange={(e) => updateField("pozivNaBroj", e.target.value)}
          />
        </Box>
        <PrimalacRacunaSection />
        <Divider sx={{ mt: 3, mb: 3 }} />
        <OnlinePrisustvaSection />
        <OfflinePrisustvaSection />
        <UkupnaNaknada />
        <Divider sx={{ mt: 3 }} />
      </Grid2>
    </Grid2>
  );
};
