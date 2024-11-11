import * as React from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField"; // import { SaveSeminarButton } from "../Forms/SeminarFormButton";
import Button from "@mui/material/Button";
import { saveSeminar } from "../../api/seminari.api";

export default function AddSeminarForm() {
  const [seminarData, setSeminarData] = React.useState({
    naziv: "",
    predavac: "",
    lokacija: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSeminarData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveSeminar(seminarData.naziv, seminarData.predavac, seminarData.lokacija);
    } catch (error) {
      console.error("Failed to save seminar:", error);
      throw new Error("Failed to save seminar");
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <TextField
        sx={{ m: 1 }}
        id="seminar-name"
        label="Naziv seminara"
        name="naziv"
        defaultValue={seminarData.naziv}
        onChange={handleChange}
      />
      <TextField
        sx={{ m: 1 }}
        id="predavac-name"
        label="Predavac"
        placeholder="Predavac"
        name="predavac"
        defaultValue={seminarData.predavac}
        onChange={handleChange}
      />
      <TextField
        sx={{ m: 1 }}
        id="seminar-location"
        label="Lokacija"
        placeholder="Mesto odrzavanja"
        name="lokacija"
        defaultValue={seminarData.lokacija}
        onChange={handleChange}
      />

      <Button sx={{ m: 1 }} size="large" variant="contained" color="primary" type="submit">
        Kreiraj seminar
      </Button>
    </Box>
  );
}
