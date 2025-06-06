import * as React from "react";
import { TextField, Box, Button, FormControl, Alert, Snackbar } from "@mui/material";
import InputAdornment from "@mui/material/InputAdornment";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { saveSeminar } from "../../api/seminari.api";
import { SeminarSchema, SeminarZodType } from "@ied-shared/index";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      ...defaultSeminarData,
      ...seminar, // Merge with existing seminar data if provided
      datum: seminar?.datum ? new Date(seminar.datum) : new Date(), // Ensure date is a Date object
    },
    resolver: zodResolver(SeminarSchema),
  });

  const [alertOpen, setAlertOpen] = React.useState(false);
  const [alertSeverity, setAlertSeverity] = React.useState<"success" | "error">("success");
  const [alertMessage, setAlertMessage] = React.useState("");

  React.useEffect(() => {
    // Reset form if the seminar prop changes (e.g., when opening dialog for different seminar)
    if (seminar) {
      reset({
        ...defaultSeminarData,
        ...seminar,
        datum: seminar.datum ? new Date(seminar.datum) : defaultSeminarData.datum,
      });
    } else {
      reset(defaultSeminarData);
    }
  }, [seminar, reset]);

  const onSubmit = async (data: SeminarZodType) => {
    try {
      // Include _id if it's an existing seminar being edited
      const payload = seminar?._id ? { ...data, _id: seminar._id } : data;
      await saveSeminar(payload);
      setAlertSeverity("success");
      setAlertMessage(seminar?._id ? "Uspešno izmenjen seminar" : "Uspešno kreiran seminar");
      setAlertOpen(true);
      // TODO: Fix missing snackbar because of dialog unmount
      onDialogClose?.();
      onSuccess?.();
    } catch (_error) {
      console.error("Failed to save seminar:", _error);
      setAlertSeverity("error");
      setAlertMessage("Greška prilikom čuvanja seminara");
      setAlertOpen(true);
    }
  };

  return (
    <>
      <h1>{seminar?._id ? "Izmeni" : "Kreiraj"} seminar</h1>
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="naziv"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              sx={{ m: 1 }}
              id="seminar-name"
              label="Naziv seminara"
              placeholder="Naziv seminara"
              error={!!errors.naziv}
              helperText={errors.naziv ? errors.naziv.message : ""}
            />
          )}
        />

        <Controller
          name="predavac"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              sx={{ m: 1 }}
              id="predavac-name"
              label="Predavač"
              placeholder="Predavač"
              error={!!errors.predavac}
              helperText={errors.predavac?.message}
            />
          )}
        />
        <Controller
          name="lokacija"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              sx={{ m: 1 }}
              id="seminar-location"
              label="Lokacija"
              placeholder="Mesto održavanja"
              error={!!errors.lokacija}
              helperText={errors.lokacija?.message}
            />
          )}
        />
        <Controller
          name="offlineCena"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Offline cena"
              id="offlineCena"
              name="offlineCena"
              sx={{ m: 1 }}
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start">RSD</InputAdornment>,
                },
              }}
              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} // Parse to number
              error={!!errors.offlineCena}
              helperText={errors.offlineCena?.message}
            />
          )}
        />

        <Controller
          name="onlineCena"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Online cena"
              id="onlineCena"
              name="onlineCena"
              sx={{ m: 1 }}
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start">RSD</InputAdornment>,
                },
              }}
              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} // Parse to number
              error={!!errors.onlineCena}
              helperText={errors.onlineCena?.message}
            />
          )}
        />

        <FormControl sx={{ m: 1 }}>
          <Controller
            name="datum"
            control={control}
            render={({ field: { onChange, value, ref } }) => (
              <DatePicker
                format="yyyy-MM-dd"
                label="Datum održavanja"
                name="datum"
                value={value ? new Date(value) : null}
                onChange={(newValue) => {
                  onChange(newValue);
                }}
                inputRef={ref}
              />
            )}
          />
        </FormControl>
        <Controller
          name="detalji"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              multiline
              rows={4}
              label="Detalji seminara"
              sx={{ m: 1 }}
              id="detalji"
              name="detalji"
              error={!!errors.detalji}
              helperText={errors.detalji?.message}
            />
          )}
        />

        <Button sx={{ m: 1 }} size="large" variant="contained" color="primary" type="submit">
          {seminar?._id ? "Izmeni" : "Kreiraj"} seminar
        </Button>
        <Snackbar
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          open={alertOpen}
          autoHideDuration={6000}
          onClose={() => setAlertOpen(false)}
        >
          <Alert severity={alertSeverity} onClose={() => setAlertOpen(false)}>
            {alertMessage}
          </Alert>
        </Snackbar>
      </Box>
    </>
  );
}
