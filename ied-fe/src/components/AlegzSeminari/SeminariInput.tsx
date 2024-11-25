import * as React from "react";
import { TextField, Box, Button, FormControl } from "@mui/material";
import InputAdornment from "@mui/material/InputAdornment";
import { format } from "date-fns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { saveSeminar } from "../../api/seminari.api";
import { useAuth } from "@clerk/clerk-react";

export default function AddSeminarForm() {
  const [seminarData, setSeminarData] = React.useState({
    naziv: "",
    predavac: "",
    lokacija: "",
    cena: "",
    datum: new Date(),
  });
  const { getToken } = useAuth();

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
    console.log("seminarData", seminarData);
    try {
      const formattedCena = isNaN(Number(seminarData.cena))
        ? "0"
        : Number(seminarData.cena).toFixed(2);
      const formattedDate = selectedDate ? format(selectedDate, "yyyy-MM-dd") : "";
      const token = await getToken();
      await saveSeminar(
        seminarData.naziv,
        seminarData.predavac,
        seminarData.lokacija,
        formattedCena,
        formattedDate,
        token
      );
    } catch (error) {
      console.error("Failed to save seminar:", error);
      throw new Error("Failed to save seminar");
    }
  };

  return (
    <>
      <h1>Kreiraj seminar</h1>
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
          id="cena"
          name="cena"
          sx={{ m: 1 }}
          slotProps={{
            input: {
              startAdornment: <InputAdornment position="start">RSD</InputAdornment>,
            },
          }}
          defaultValue={seminarData.cena}
          onChange={handleChange}
        />

        <FormControl sx={{ m: 1 }}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              format="yyyy/MM/dd"
              label="Select Date"
              name="datum"
              value={selectedDate}
              onChange={handleDateChange}
              defaultValue={seminarData.datum}
            />
          </LocalizationProvider>
        </FormControl>

        <Button sx={{ m: 1 }} size="large" variant="contained" color="primary" type="submit">
          Kreiraj seminar
        </Button>
      </Box>
    </>
  );
}
