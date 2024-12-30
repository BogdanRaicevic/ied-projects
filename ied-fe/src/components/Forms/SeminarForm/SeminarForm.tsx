import { TextField, Box } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
// import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
// import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import type { Seminar, SeminarSchema } from "../../../schemas/companySchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import Grid from "@mui/material/Grid2";
import {
	ArchiveSeminarButton,
	CancelSeminarButton,
	DeleteSeminarButton,
	SaveSeminarButton,
} from "../SeminarFormButton";

interface CreateSeminarFormProps {
	seminarData?: Seminar;
	isInUpdateForm?: boolean;
	saveOrUpdateSeminar: (data: any) => void;
	closeDialog?: () => void;
}

export default function SeminarForm({
	saveOrUpdateSeminar,
	seminarData,
	isInUpdateForm,
	closeDialog,
}: CreateSeminarFormProps) {
	const {
		handleSubmit,
		control,
		formState: { errors },
	} = useForm<Seminar>({
		resolver: zodResolver(SeminarSchema),
		defaultValues: seminarData || {
			datum: new Date(),
		},
	});

	const handleSaveSeminar = (data: any) => {
		saveOrUpdateSeminar(data);
		if (closeDialog) {
			closeDialog();
		}
	};

	const onError = (errors: any, e: any) => {
		console.log(errors, e);
	};

	const handleArchiveSeminar = (data: any) => {
		const seminar = { ...data, arhiviran: true };
		// TODO: i need state management to update seminar
		saveOrUpdateSeminar(seminar);
		console.log(seminar);
	};

	const handleCancelSeminar = (_data: any) => {
		// TODO: i need state management to update seminar
	};

	const handleDeleteSeminar = (_data: any) => {
		if (window.confirm("Potvrdi da obrises seminar?")) {
			// TODO: BE code to delete seminar
		}
	};

	return (
		<Box
			mx={2}
			display={"flex"}
			onSubmit={handleSubmit(handleSaveSeminar, onError)}
			component="form"
		>
			<Grid
				container
				spacing={{ xs: 2, md: 3 }}
				columns={{ xs: 4, sm: 8, md: 12 }}
			>
				<Grid size={4}>
					<Controller
						name="naziv"
						control={control}
						defaultValue=""
						render={({ field }) => (
							<TextField
								fullWidth
								sx={{ m: 1 }}
								id="naziv"
								label="Naziv"
								variant="outlined"
								{...field}
								error={Boolean(errors.naziv)}
								helperText={errors.naziv?.message}
							/>
						)}
					></Controller>
				</Grid>
				<Grid size={4}>
					<Controller
						name="predavac"
						control={control}
						defaultValue=""
						render={({ field }) => (
							<TextField
								fullWidth
								sx={{ m: 1 }}
								id="predavac"
								label="Predavac"
								variant="outlined"
								{...field}
								error={Boolean(errors.predavac)}
								helperText={errors.predavac?.message}
							/>
						)}
					></Controller>
				</Grid>
				<Grid size={4}>
					<Controller
						name="lokacija"
						control={control}
						defaultValue=""
						render={({ field }) => (
							<TextField
								fullWidth
								sx={{ m: 1 }}
								id="lokacija"
								label="Lokacija odrazavanja"
								variant="outlined"
								{...field}
								error={Boolean(errors.lokacija)}
								helperText={errors.lokacija?.message}
							/>
						)}
					></Controller>
				</Grid>
				<Grid size={4}>
					<Controller
						name="offlineCena"
						control={control}
						defaultValue={0}
						render={({ field }) => (
							<TextField
								fullWidth
								sx={{ m: 1 }}
								id="offlineCena"
								label="Offline cena"
								variant="outlined"
								type="number"
								value={field.value}
								onChange={(e) => {
									field.onChange(Number(e.target.value));
								}}
								error={Boolean(errors.offlineCena)}
								helperText={errors.offlineCena?.message}
							/>
						)}
					></Controller>
				</Grid>
				<Grid size={4}>
					<Controller
						name="onlineCena"
						control={control}
						defaultValue={0}
						render={({ field }) => (
							<TextField
								fullWidth
								sx={{ m: 1 }}
								id="onlineCena"
								label="Online cena"
								variant="outlined"
								type="number"
								value={field.value}
								onChange={(e) => {
									field.onChange(Number(e.target.value));
								}}
								error={Boolean(errors.onlineCena)}
								helperText={errors.onlineCena?.message}
							/>
						)}
					></Controller>
				</Grid>
				{/* <Grid size={4}>
          <Controller
            control={control}
            name="datum"
            rules={{ required: true }}
            render={({ field, fieldState }) => (
              <FormControl fullWidth sx={{ m: 1 }}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    format="dd/MM/yyyy"
                    label="Datum odrzavanja"
                    value={field.value}
                    onChange={(newValue) => {
                      field.onChange(newValue);
                      return newValue;
                    }}
                    slots={{
                      textField: ({ ...params }) => (
                        <TextField
                          {...params}
                          error={!!fieldState.invalid}
                          helperText={fieldState.error && "Datum odrzavanja is required"}
                        />
                      ),
                    }}
                  />
                </LocalizationProvider>
              </FormControl>
            )}
          ></Controller>
        </Grid> */}

				<Box ml={2} display="flex" justifyContent="space-between" width="100%">
					<Box display="flex">
						<SaveSeminarButton
							onSubmit={handleSubmit(handleSaveSeminar, onError)}
						/>
						{isInUpdateForm && (
							<ArchiveSeminarButton
								onSubmit={handleSubmit(handleArchiveSeminar, onError)}
							/>
						)}
					</Box>

					{isInUpdateForm && (
						<Box>
							{/* TODO: implement cancel and delete seminar */}
							<CancelSeminarButton
								onSubmit={handleSubmit(handleCancelSeminar, onError)}
							/>
							<DeleteSeminarButton
								onSubmit={handleSubmit(handleDeleteSeminar, onError)}
							/>
						</Box>
					)}
				</Box>
			</Grid>
		</Box>
	);
}
