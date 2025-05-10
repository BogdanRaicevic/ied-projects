import { Grid2, Divider, Typography, TextField, Box } from "@mui/material";
import { PrimalacRacunaSection } from "./components/PrimalacRacunaSection";
import { AvansSection } from "./components/AvansSection";
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
    <Grid2 container>
      <Grid2 size={12}>
        <Box
          sx={{ display: "flex", alignItems: "center", justifyContent: "center", mb: 3, gap: 2 }}
        >
          <Typography variant="h4">Avansni račun</Typography>
          {pozivNaBroj}
        </Box>
        <PrimalacRacunaSection />
        <Divider sx={{ mt: 3, mb: 3 }} />
        <AvansSection />
      </Grid2>
    </Grid2>
  );
};
