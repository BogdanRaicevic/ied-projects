import { Grid2, Paper, TextField, Box, Autocomplete } from "@mui/material";
import { forwardRef, useImperativeHandle, useState, useEffect } from "react";
import SelectFirma from "./SelectFirma";
import { IzdavacRacuna } from "./types";

export interface IzdavacRacunaSectionRef {
  getIzdavacRacunaData: () => IzdavacRacuna | null;
  getTekuciRacun: () => string;
}

interface IzdavacRacunaSectionProps {
  selectedFirmaData: IzdavacRacuna | null;
  onFirmaChange: (data: IzdavacRacuna | null) => void;
}

export const IzdavacRacunaSection = forwardRef<IzdavacRacunaSectionRef, IzdavacRacunaSectionProps>(
  ({ selectedFirmaData, onFirmaChange }, ref) => {
    const [selectedTekuciRacun, setSelectedTekuciRacun] = useState<string>("");

    useEffect(() => {
      if (selectedFirmaData?.tekuciRacuni?.length) {
        setSelectedTekuciRacun(selectedFirmaData.tekuciRacuni[0]);
      }
    }, [selectedFirmaData]);

    useImperativeHandle(ref, () => ({
      getIzdavacRacunaData: () => selectedFirmaData,
      getTekuciRacun: () => selectedTekuciRacun,
    }));

    return (
      <Grid2 component={Paper} size={12} container>
        <Grid2 size={7}>
          <Box sx={{ padding: "1rem" }}>
            <TextField
              fullWidth
              variant="filled"
              label="Podaci o izdavaocu računa"
              value={selectedFirmaData?.naziv ?? ""}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              variant="filled"
              label="Kontakt telefoni"
              value={selectedFirmaData?.kontaktTelefoni.join(", ") ?? ""}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              variant="filled"
              label="PIB"
              value={selectedFirmaData?.pib ?? ""}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              variant="filled"
              label="Matični broj"
              value={selectedFirmaData?.maticniBroj ?? ""}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              variant="filled"
              label="Broj rešenja o evidenciji za PDV"
              value={selectedFirmaData?.brojResenjaOEvidencijiZaPDV ?? ""}
              sx={{ mb: 2 }}
            />
            <Autocomplete
              fullWidth
              options={selectedFirmaData?.tekuciRacuni ?? []}
              value={selectedTekuciRacun}
              renderInput={(params) => (
                <TextField {...params} variant="filled" label="Tekući račun" sx={{ mb: 2 }} />
              )}
              onChange={(_, newValue) => {
                if (newValue) {
                  setSelectedTekuciRacun(newValue);
                }
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
            <SelectFirma onFirmaChange={onFirmaChange} />
          </Box>
        </Grid2>
      </Grid2>
    );
  }
);
