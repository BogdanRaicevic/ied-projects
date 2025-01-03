import * as React from "react";
import {
	TextField,
	Box,
	Button,
	FormControl,
	Alert,
	Snackbar,
} from "@mui/material";
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
		offlineCena: "",
		onlineCena: "",
		datum: new Date(),
	});
	const [selectedDate, setSelectedDate] = React.useState<Date | null>(
		new Date(),
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
	const [alertSeverity, setAlertSeverity] = React.useState<"success" | "error">(
		"success",
	);
	const [alertMessage, setAlertMessage] = React.useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			const formattedOfflineCena = isNaN(Number(seminarData.offlineCena))
				? "0"
				: Number(seminarData.offlineCena).toFixed(2);
			const formattedOnlineCena = isNaN(Number(seminarData.onlineCena))
				? "0"
				: Number(seminarData.onlineCena).toFixed(2);
			const formattedDate = selectedDate
				? format(selectedDate, "yyyy-MM-dd")
				: "";

			try {
				await saveSeminar(
					seminarData.naziv,
					seminarData.predavac,
					seminarData.lokacija,
					formattedOfflineCena,
					formattedOnlineCena,
					formattedDate,
				);

				setAlertSeverity("success");
				setAlertMessage("Uspešno kreiran seminar");
				setAlertOpen(true);
			} catch (error) {
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
					label="Offline cena"
					id="offlineCena"
					name="offlineCena"
					sx={{ m: 1 }}
					slotProps={{
						input: {
							startAdornment: (
								<InputAdornment position="start">RSD</InputAdornment>
							),
						},
					}}
					defaultValue={seminarData.offlineCena}
					onChange={handleChange}
				/>
				<TextField
					label="Online seminara"
					id="onlineCena"
					name="onlineCena"
					sx={{ m: 1 }}
					slotProps={{
						input: {
							startAdornment: (
								<InputAdornment position="start">RSD</InputAdornment>
							),
						},
					}}
					defaultValue={seminarData.onlineCena}
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
							disablePast
						/>
					</LocalizationProvider>
				</FormControl>
				<Button
					sx={{ m: 1 }}
					size="large"
					variant="contained"
					color="primary"
					type="submit"
				>
					Kreiraj seminar
				</Button>
				<Snackbar
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
