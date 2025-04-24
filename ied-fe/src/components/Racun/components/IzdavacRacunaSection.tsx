import { Grid2, Paper, TextField, Box, Autocomplete } from "@mui/material";
import SelectFirma from "../SelectFirma";
import { useRacunStore } from "../store/useRacunStore";

export const IzdavacRacunaSection = () => {
  const izdavacRacuna = useRacunStore((state) => state.izdavacRacuna);
  const setIzdavacRacuna = useRacunStore((state) => state.setIzdavacRacuna);
  const tekuciRacun = useRacunStore((state) => state.selectedTekuciRacun);
  const setTekuciRacun = useRacunStore((state) => state.setTekuciRacun);

  return (
    <Grid2 component={Paper} size={12} container>
      <Grid2 size={7}>
        <Box sx={{ padding: "1rem" }}>
          <TextField
            fullWidth
            variant="filled"
            label="Podaci o izdavaocu računa"
            value={izdavacRacuna?.naziv ?? ""}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            variant="filled"
            label="Kontakt telefoni"
            value={izdavacRacuna?.kontaktTelefoni.join(", ") ?? ""}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            variant="filled"
            label="PIB"
            value={izdavacRacuna?.pib ?? ""}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            variant="filled"
            label="Matični broj"
            value={izdavacRacuna?.maticniBroj ?? ""}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            variant="filled"
            label="Broj rešenja o evidenciji za PDV"
            value={izdavacRacuna?.brojResenjaOEvidencijiZaPDV ?? ""}
            sx={{ mb: 2 }}
          />
          <Autocomplete
            fullWidth
            options={izdavacRacuna?.tekuciRacuni ?? []}
            value={tekuciRacun}
            renderInput={(params) => (
              <TextField {...params} variant="filled" label="Tekući račun" sx={{ mb: 2 }} />
            )}
            onChange={(_, newValue) => {
              if (newValue) {
                setTekuciRacun(newValue);
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
          <SelectFirma
            onFirmaChange={(data) => {
              setIzdavacRacuna(data);
              setTekuciRacun(data.tekuciRacuni[0]);
            }}
          />
        </Box>
      </Grid2>
    </Grid2>
  );
};
