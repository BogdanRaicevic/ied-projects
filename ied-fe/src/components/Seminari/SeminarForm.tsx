import * as React from "react";
import { TextField, Box, Button, FormControl, Alert, Snackbar } from "@mui/material";
import InputAdornment from "@mui/material/InputAdornment";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { saveSeminar } from "../../api/seminari.api";
import { SeminarZodType } from "@ied-shared/index";

export default function SeminarForm({
  seminar,
  onDialogClose,
  onSuccess,
}: {
  seminar?: Partial<SeminarZodType>;
  onDialogClose?: () => void;
  onSuccess?: () => void;
}) {
  const defaultSeminarData: SeminarZodType = {
    naziv: "",
    predavac: "",
    lokacija: "",
    offlineCena: 0,
    onlineCena: 0,
    datum: new Date(),
    detalji: "",
    prijave: [],
  };
  const [seminarData, setSeminarData] = React.useState<SeminarZodType>({
    ...defaultSeminarData,
    ...seminar,
  });

  const [selectedDate, setSelectedDate] = React.useState<Date | null>(
    seminar?.datum ? new Date(seminar.datum) : new Date()
  );

  const handleDateChange = (newDate: Date | null) => {
    setSelectedDate(newDate);
    setSeminarData((prev) => ({
      ...prev,
      datum: newDate || new Date(),
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSeminarData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const [alertOpen, setAlertOpen] = React.useState(false);
  const [alertSeverity, setAlertSeverity] = React.useState<"success" | "error">("success");
  const [alertMessage, setAlertMessage] = React.useState("");

  // TODO: refactor error handling, show snackbar on error
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!seminarData.naziv) {
        setAlertSeverity("error");
        setAlertMessage("Naziv seminara je obavezan");
        setAlertOpen(true);
        onDialogClose?.();
        return;
      }

      try {
        await saveSeminar(seminarData);

        setAlertSeverity("success");
        setAlertMessage("Uspešno kreiran seminar");
        setAlertOpen(true);
        onDialogClose?.(); // Close dialog and refresh parent
        onSuccess?.(); // Refresh parent
      } catch (_error) {
        setAlertSeverity("error");
        setAlertMessage("Greška prilikom kreiranja seminara");
        setAlertOpen(true);
      }
    } catch (error) {
      console.error("Failed to save seminar:", error);
      throw new Error("Failed to save seminar");
    }
  };

  return (
    <>
      <h1>{seminar?._id ? "Izmeni" : "Kreiraj"} seminar</h1>
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
          label="Offline cena"
          id="offlineCena"
          name="offlineCena"
          sx={{ m: 1 }}
          slotProps={{
            input: {
              startAdornment: <InputAdornment position="start">RSD</InputAdornment>,
            },
          }}
          value={seminarData.offlineCena}
          onChange={handleChange}
        />
        <TextField
          label="Online cena"
          id="onlineCena"
          name="onlineCena"
          sx={{ m: 1 }}
          slotProps={{
            input: {
              startAdornment: <InputAdornment position="start">RSD</InputAdornment>,
            },
          }}
          value={seminarData.onlineCena}
          onChange={handleChange}
        />
        <FormControl sx={{ m: 1 }}>
          <DatePicker
            format="yyyy-MM-dd"
            label="Datum održavanja"
            name="datum"
            value={selectedDate}
            onChange={handleDateChange}
          />
        </FormControl>
        <TextField
          fullWidth
          multiline
          rows={4}
          label="Detalji seminara"
          sx={{ m: 1 }}
          id="detalji"
          name="detalji"
          value={seminarData.detalji}
          onChange={handleChange}
        />
        <Button sx={{ m: 1 }} size="large" variant="contained" color="primary" type="submit">
          {seminar?._id ? "Izmeni" : "Kreiraj"} seminar
        </Button>
        <Snackbar open={alertOpen} autoHideDuration={6000} onClose={() => setAlertOpen(false)}>
          <Alert severity={alertSeverity} onClose={() => setAlertOpen(false)}>
            {alertMessage}
          </Alert>
        </Snackbar>
      </Box>
    </>
  );
}
