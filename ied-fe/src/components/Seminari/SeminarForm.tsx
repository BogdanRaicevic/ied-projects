import { zodResolver } from "@hookform/resolvers/zod";
import { SeminarSchema, type SeminarZodType } from "@ied-shared/index";
import {
  Alert,
  Button,
  FormControl,
  Grid,
  Snackbar,
  TextField,
} from "@mui/material";
import InputAdornment from "@mui/material/InputAdornment";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useEffect, useState } from "react";
import {
  Controller,
  type Resolver,
  type SubmitHandler,
  useForm,
} from "react-hook-form";
import {
  useCreateSeminarMutation,
  useUpdateSeminarMutation,
} from "../../hooks/seminar/useSeminarMutations";

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
  } = useForm<SeminarZodType>({
    defaultValues: {
      ...defaultSeminarData,
      ...seminar, // Merge with existing seminar data if provided
      datum: seminar?.datum ? new Date(seminar.datum) : new Date(), // Ensure date is a Date object
    },
    resolver: zodResolver(SeminarSchema) as Resolver<SeminarZodType>,
  });

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState<"success" | "error">(
    "success",
  );
  const [alertMessage, setAlertMessage] = useState("");

  const createSeminarMutation = useCreateSeminarMutation();
  const updateSeminarMutation = useUpdateSeminarMutation();
  const isPending =
    createSeminarMutation.isPending || updateSeminarMutation.isPending;

  useEffect(() => {
    // Reset form if the seminar prop changes (e.g., when opening dialog for different seminar)
    if (seminar) {
      reset({
        ...defaultSeminarData,
        ...seminar,
        datum: seminar.datum
          ? new Date(seminar.datum)
          : defaultSeminarData.datum,
      });
    } else {
      reset(defaultSeminarData);
    }
  }, [seminar, reset]);

  const onSubmit: SubmitHandler<SeminarZodType> = async (data) => {
    try {
      if (seminar?._id) {
        await updateSeminarMutation.mutateAsync({ ...data, _id: seminar._id });
        setAlertMessage("Uspešno izmenjen seminar");
      } else {
        await createSeminarMutation.mutateAsync(data);
        setAlertMessage("Uspešno kreiran seminar");
      }

      setAlertSeverity("success");
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
      <Grid
        container
        spacing={2}
        component="form"
        onSubmit={handleSubmit(onSubmit)}
      >
        <Grid size={3}>
          <Controller
            name="naziv"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                sx={{ m: 1 }}
                label="Naziv seminara"
                placeholder="Naziv seminara"
                error={!!errors.naziv}
                helperText={errors.naziv ? errors.naziv.message : ""}
                fullWidth
              />
            )}
          />
        </Grid>

        <Grid size={3}>
          <Controller
            name="predavac"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                sx={{ m: 1 }}
                label="Predavač"
                placeholder="Predavač"
                error={!!errors.predavac}
                helperText={errors.predavac?.message}
                fullWidth
              />
            )}
          />
        </Grid>

        <Grid size={3}>
          <Controller
            name="lokacija"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                sx={{ m: 1 }}
                label="Lokacija"
                placeholder="Mesto održavanja"
                error={!!errors.lokacija}
                helperText={errors.lokacija?.message}
                fullWidth
              />
            )}
          />
        </Grid>

        <Grid size={3}>
          <Controller
            name="offlineCena"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Offline cena"
                name="offlineCena"
                sx={{ m: 1 }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">RSD</InputAdornment>
                    ),
                  },
                }}
                onChange={(e) =>
                  field.onChange(parseFloat(e.target.value) || 0)
                } // Parse to number
                error={!!errors.offlineCena}
                helperText={errors.offlineCena?.message}
                fullWidth
              />
            )}
          />
        </Grid>

        <Grid size={3}>
          <Controller
            name="onlineCena"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Online cena"
                name="onlineCena"
                sx={{ m: 1 }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">RSD</InputAdornment>
                    ),
                  },
                }}
                onChange={(e) =>
                  field.onChange(parseFloat(e.target.value) || 0)
                } // Parse to number
                error={!!errors.onlineCena}
                helperText={errors.onlineCena?.message}
                fullWidth
              />
            )}
          />
        </Grid>

        <Grid size={3}>
          <FormControl fullWidth sx={{ m: 1 }}>
            <Controller
              name="datum"
              control={control}
              render={({ field }) => (
                <DatePicker
                  format="yyyy-MM-dd"
                  label="Datum održavanja"
                  value={field.value ?? null}
                  onChange={(date) => field.onChange(date)}
                />
              )}
            />
          </FormControl>
        </Grid>

        <Grid size={12}>
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
                name="detalji"
                error={!!errors.detalji}
                helperText={errors.detalji?.message}
              />
            )}
          />
        </Grid>

        <Button
          sx={{ m: 1 }}
          size="large"
          variant="contained"
          color="primary"
          type="submit"
          disabled={isPending}
        >
          {isPending
            ? "Čuvanje..."
            : (seminar?._id ? "Izmeni" : "Kreiraj") + " seminar"}
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
      </Grid>
    </>
  );
}
