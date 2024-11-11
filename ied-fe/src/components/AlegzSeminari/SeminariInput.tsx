import * as React from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField"; // import { SaveSeminarButton } from "../Forms/SeminarFormButton";
import Button from "@mui/material/Button";
import { saveSeminar } from "../../api/seminari.api";

export default function AddSeminarForm() {
  const [seminariData, setSeminarData] = React.useState({
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
      await saveSeminar(seminariData.naziv, seminariData.predavac, seminariData.lokacija);
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
        name="seminarName"
        defaultValue={seminariData.naziv}
        onChange={handleChange}
      />
      <TextField
        sx={{ m: 1 }}
        id="predavac-name"
        label="Predavac"
        placeholder="Predavac"
        name="lecturer"
        defaultValue={seminariData.predavac}
        onChange={handleChange}
      />
      <TextField
        sx={{ m: 1 }}
        id="seminar-location"
        label="Lokacija"
        placeholder="Mesto odrzavanja"
        name="location"
        defaultValue={seminariData.lokacija}
        onChange={handleChange}
      />

      <Button sx={{ m: 1 }} size="large" variant="contained" color="primary" type="submit">
        Kreiraj seminar
      </Button>
    </Box>
  );
}
