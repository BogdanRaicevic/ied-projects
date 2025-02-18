import * as React from "react";
import { TextField, Box, Button, FormControl, Alert, Snackbar } from "@mui/material";
import InputAdornment from "@mui/material/InputAdornment";
import { format, parse } from "date-fns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { saveSeminar } from "../../api/seminari.api";
import type { SeminarType } from "../../schemas/firmaSchemas";

export default function SeminarForm({
  seminar,
  onDialogClose,
  onSuccess,
}: {
  seminar?: Partial<SeminarType>;
  onDialogClose?: () => void;
  onSuccess?: () => void;
}) {
  const defaultSeminarData: Partial<SeminarType> = {
    naziv: "",
    predavac: "",
    lokacija: "",
    offlineCena: "",
    onlineCena: "",
    datum: format(new Date(), "yyyy-MM-dd"),
  };
  const [seminarData, setSeminarData] = React.useState(seminar || defaultSeminarData);

  const parseDateString = (dateString?: string | null | undefined): Date => {
    if (!dateString) {
      return parse(new Date().toISOString(), "yyyy-MM-dd", new Date());
    }
    return parse(dateString, "yyyy-MM-dd", new Date());
  };

  const [selectedDate, setSelectedDate] = React.useState<Date | null>(
    parseDateString(seminar?.datum) // create date-fns date object from string format yyyy-MM-dd, or today
  );

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

  const [alertOpen, setAlertOpen] = React.useState(false);
  const [alertSeverity, setAlertSeverity] = React.useState<"success" | "error">("success");
  const [alertMessage, setAlertMessage] = React.useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formattedOfflineCena = Number.isNaN(Number(seminarData.offlineCena))
        ? "0"
        : Number(seminarData.offlineCena).toFixed(2);
      const formattedOnlineCena = Number.isNaN(Number(seminarData.onlineCena))
        ? "0"
        : Number(seminarData.onlineCena).toFixed(2);
      const formattedDate = selectedDate ? format(selectedDate, "yyyy-MM-dd") : "";

      if (!seminarData.naziv) {
        setAlertSeverity("error");
        setAlertMessage("Naziv seminara je obavezan");
        setAlertOpen(true);
        onDialogClose?.();
        return;
      }

      try {
        await saveSeminar(
          seminarData.naziv,
          seminarData.predavac || "",
          seminarData.lokacija || "",
          formattedOfflineCena,
          formattedOnlineCena,
          formattedDate,
          seminarData?._id
        );

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
          defaultValue={seminarData.offlineCena}
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
          defaultValue={seminarData.onlineCena}
          onChange={handleChange}
        />
        <FormControl sx={{ m: 1 }}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              format="yyyy-MM-dd"
              label="Datum održavanja"
              name="datum"
              value={selectedDate}
              onChange={handleDateChange}
              disablePast
            />
          </LocalizationProvider>
        </FormControl>
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
