import * as React from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField"; // import { SaveSeminarButton } from "../Forms/SeminarFormButton";
import Button from "@mui/material/Button";
import InputAdornment from "@mui/material/InputAdornment";
import { format } from "date-fns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { saveSeminar } from "../../api/seminari.api";

export default function AddSeminarForm() {
  const [seminarData, setSeminarData] = React.useState({
    naziv: "",
    predavac: "",
    lokacija: "",
    cena: "",
    datum: new Date(),
  });

  const [selectedDate, setSelectedDate] = React.useState<Date | null>(new Date());

  const handleDateChange = (newDate: Date | null) => {
    setSelectedDate(newDate);
  };

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
      const formattedCena = parseFloat(seminarData.cena).toFixed(2);
      const formattedDate = selectedDate ? format(selectedDate, "yyyy-MM-dd") : "";
      await saveSeminar(
        seminarData.naziv,
        seminarData.predavac,
        seminarData.lokacija,
        formattedCena,
        formattedDate
      );
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

      <TextField
        label="Cena seminara"
        id="cenaSeminara"
        sx={{ m: 1 }}
        slotProps={{
          input: {
            startAdornment: <InputAdornment position="start">RSD</InputAdornment>,
          },
        }}
        defaultValue={seminarData.cena}
      />

      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          label="Select Date"
          value={selectedDate}
          onChange={handleDateChange}
          defaultValue={seminarData.datum}
        />
      </LocalizationProvider>

      <Button sx={{ m: 1 }} size="large" variant="contained" color="primary" type="submit">
        Kreiraj seminar
      </Button>
    </Box>
  );
}
