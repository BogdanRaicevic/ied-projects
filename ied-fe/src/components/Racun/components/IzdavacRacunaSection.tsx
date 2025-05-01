import { Grid2, Paper, TextField, Box, Autocomplete } from "@mui/material";
import SelectIzdavacRacuna from "../SelectIzdavacRacuna";
import { useRacunStore } from "../store/useRacunStore";
import { useFetchIzdavaciRacuna } from "../../../hooks/useFetchData";
import { useEffect, useMemo } from "react";

export const IzdavacRacunaSection = () => {
  const selectedIzdavac = useRacunStore((state) => state.racunData.izdavacRacuna);
  const tekuciRacun = useRacunStore((state) => state.racunData.tekuciRacun);
  const updateField = useRacunStore((state) => state.updateField);

  const { data: allIzdavaciData, isLoading } = useFetchIzdavaciRacuna();

  const currentIzdavacData = useMemo(() => {
    if (isLoading || !allIzdavaciData || !selectedIzdavac) {
      return null;
    }

    return allIzdavaciData?.find(
      (f: { id: string; tekuciRacuni: string[] }) => f.id === selectedIzdavac
    );
  }, [selectedIzdavac, isLoading, allIzdavaciData]);

  const tekuciRacuniOptions = currentIzdavacData?.tekuciRacuni || [];

  if (isLoading) {
    return <div>Loading Firma data...</div>;
  }

  return (
    <Grid2 component={Paper} size={12} container>
      <Grid2 size={7}>
        <Box sx={{ padding: "1rem" }}>
          <Autocomplete
            fullWidth
            options={tekuciRacuniOptions}
            value={tekuciRacun || null}
            renderInput={(params) => (
              <TextField {...params} variant="filled" label="Tekući račun" sx={{ mb: 2 }} />
            )}
            onChange={(_, newValue) => {
              updateField("tekuciRacun", newValue || "");
            }}
          />
        </Box>
      </Grid2>
      <Grid2 size={5}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            p: 1,
          }}
        >
          <SelectIzdavacRacuna />
        </Box>
      </Grid2>
    </Grid2>
  );
};
