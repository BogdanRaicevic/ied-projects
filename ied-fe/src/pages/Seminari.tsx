import { Box, Button, FormControl, TextField } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { useState } from "react";
import { addMonths, subMonths } from "date-fns";
import SeminarForm from "../components/Seminari/SeminarForm";
import { UnfoldLess } from "@mui/icons-material";
import SeminariTable from "../components/Seminari/SeminariTable";

export default function Seminari() {
	const [queryParameters, setQueryParameters] = useState({
		naziv: "",
		predavac: "",
		lokacija: "",
		datumOd: subMonths(new Date(), 3),
		datumDo: addMonths(new Date(), 3),
	});
	const [tableInputParameters, setTableInputParameters] = useState({
		naziv: "",
		predavac: "",
		lokacija: "",
		datumOd: subMonths(new Date(), 3),
		datumDo: addMonths(new Date(), 3),
	});

	const [seminariUpdateCounter, setSeminarUpdateCounter] = useState(0);
	const handleSeminarUpdate = () => {
		setSeminarUpdateCounter((prev) => prev + 1);
	};
	const handlePretraziSeminare = () => {
		setTableInputParameters(queryParameters);
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { id, value } = e.target;
		setQueryParameters((prev) => ({
			...prev,
			[id]: value,
		}));
	};

	const handleDateChange = (filedName: string, date: Date | null) => {
		setQueryParameters((prev) => ({
			...prev,
			[filedName]: date || "",
		}));
	};

	const parametriPretrage = () => (
		<>
			<h1>Parametri Pretrage</h1>
			<Box>
				<TextField
					sx={{ m: 1 }}
					id="naziv"
					label="Naziv seminara"
					variant="outlined"
					defaultValue={queryParameters.naziv}
					onChange={handleInputChange}
				/>
				<TextField
					sx={{ m: 1 }}
					id="predavac"
					label="Predavac"
					variant="outlined"
					defaultValue={queryParameters.predavac}
					onChange={handleInputChange}
				/>
				<TextField
					sx={{ m: 1 }}
					id="lokacija"
					label="Lokacija"
					variant="outlined"
					defaultValue={queryParameters.lokacija}
					onChange={handleInputChange}
				/>
				<FormControl sx={{ m: 1 }}>
					<LocalizationProvider dateAdapter={AdapterDateFns}>
						<DatePicker
							format="yyyy/MM/dd"
							label="Početni datum"
							name="datumOd"
							defaultValue={queryParameters.datumOd}
							onChange={(date) => handleDateChange("datumOd", date)}
						/>
						<Box display="flex" alignItems="center" justifyContent="center">
							<UnfoldLess />
						</Box>
						<DatePicker
							format="yyyy/MM/dd"
							label="Kranji datum"
							name="datumDo"
							defaultValue={queryParameters.datumDo}
							onChange={(date) => handleDateChange("datumDo", date)}
						/>
					</LocalizationProvider>
				</FormControl>
				<Button
					onClick={handlePretraziSeminare}
					sx={{ m: 1 }}
					size="large"
					variant="contained"
					color="info"
					type="submit"
				>
					Pretrazi
				</Button>
			</Box>
		</>
	);

	return (
		<>
			{parametriPretrage()}

			<SeminariTable
				queryParameters={tableInputParameters}
				updateCounter={seminariUpdateCounter}
			/>

			<SeminarForm onSuccess={handleSeminarUpdate} />
		</>
	);
}
