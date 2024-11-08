import * as React from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
// import { SaveSeminarButton } from "../Forms/SeminarFormButton";
import Button from "@mui/material/Button";
import { saveSeminar } from "../../api/seminari.api";

export default function AddSeminarForm() {
  const [seminariData, setSeminarData] = React.useState({
    naziv: "",
    predavac: "",
    lokacija: "npr Hotel X, Beograd",
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
      const response = await saveSeminar(
        seminariData.naziv,
        seminariData.predavac,
        seminariData.lokacija
      );
      console.log("Response from API:", response);
    } catch (error) {
      console.error("Failed to save seminar:", error);
    }
  };

  return (
    <Box
      component="form"
      sx={{ "& .MuiTextField-root": { m: 1, width: "25ch" } }}
      noValidate
      autoComplete="off"
      onSubmit={handleSubmit}
    >
      <h2>Jos jedan seminar input</h2>
      <div>
        <TextField
          id="outlined-multiline-flexible"
          label="Naziv seminara"
          multiline
          maxRows={4}
          name="naziv"
          value={seminariData.naziv}
          onChange={handleChange}
        />
        <TextField
          id="outlined-textarea"
          label="Predavac"
          placeholder="Predavac"
          multiline
          name="predavac"
          value={seminariData.predavac}
          onChange={handleChange}
        />
        <TextField
          id="outlined-textarea-two"
          label="Lokacija"
          placeholder="Mesto odrzavanja"
          multiline
          name="lokacija"
          value={seminariData.lokacija}
          onChange={handleChange}
        />
      </div>
      <Button sx={{ m: 1 }} size="large" variant="contained" color="primary" type="submit">
        Kreiraj seminar
      </Button>
    </Box>
  );
}
