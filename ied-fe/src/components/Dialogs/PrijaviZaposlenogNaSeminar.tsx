import {
	Dialog,
	DialogTitle,
	DialogContent,
	Button,
	TextField,
	DialogActions,
	FormControl,
	FormControlLabel,
	FormLabel,
	Radio,
	RadioGroup,
	Autocomplete,
	Typography,
	Box,
	Alert,
} from "@mui/material";
import { Grid } from "@mui/system";
import { useFetchSeminari } from "../../hooks/useFetchData";
import type {
	Company,
	PrijavaNaSeminar,
	Zaposleni,
} from "../../schemas/companySchemas";
import { savePrijava } from "../../api/seminari.api";
import { useState } from "react";

export default function PrijavaNaSeminarDialog({
	open,
	onClose,
	companyData,
	zaposleniData,
}: {
	open: boolean;
	onClose: () => void;
	companyData: Company;
	zaposleniData: Zaposleni;
}) {
	const [prijavaFailed, setPrijavaFailed] = useState(false);
	const [selectedSeminar, setSelectedSeminar] = useState<string>("");
	const [prisustvo, setPrisustvo] = useState<"online" | "offline" | "ne znam">(
		"online",
	);

	const handleSavePrijava = async () => {
		if (!companyData?._id || !zaposleniData?._id || !selectedSeminar) {
			throw new Error("Nedostaju podaci o firmi, zaposlenom ili seminaru");
		}

		const prijava: PrijavaNaSeminar = {
			firma_id: companyData._id,
			zaposleni_id: zaposleniData._id,
			prisustvo,
			seminar_id: selectedSeminar,
			firma_naziv: companyData.naziv_firme,
			firma_email: companyData.e_mail,
			firma_telefon: companyData.telefon,
			zaposleni_ime: zaposleniData.ime,
			zaposleni_prezime: zaposleniData.prezime,
			zaposleni_email: zaposleniData.e_mail,
			zaposleni_telefon: zaposleniData.telefon,
		};

		console.log("Saving prijava", prijava);
		try {
			await savePrijava(prijava);
			onClose();
		} catch (error: any) {
			console.error("Error saving prijava: ", error);
			setPrijavaFailed(true);
		}
	};

	const { fetchedSeminars } = useFetchSeminari();

	const seminari = fetchedSeminars?.seminari;

	return (
		<Dialog open={open} onClose={onClose} maxWidth="lg">
			<DialogTitle id="prijavi-na-seminar-dialog-title">
				{"Prijavi osobu na seminar"}
			</DialogTitle>
			<DialogContent>
				<Grid container spacing={2} alignItems="center">
					<Grid size={12}>
						<TextField
							sx={{ m: 2 }}
							key={"prijava-naziv-firme"}
							value={companyData?.naziv_firme || "/"}
							label="Naziv Firme"
							disabled
						/>
						<TextField
							sx={{ m: 2 }}
							key={"prijava-email-firme"}
							value={companyData?.e_mail || "/"}
							label="Email Firme"
							disabled
						/>
						<TextField
							sx={{ m: 2 }}
							key={"prijava-telefon-firme"}
							value={companyData?.telefon || "/"}
							label="Telefon Firme"
							disabled
						/>
					</Grid>
					<Grid size={12}>
						<TextField
							sx={{ m: 2 }}
							key={"prijava-ime-zaposlenog"}
							value={zaposleniData?.ime || "/"}
							label="Ime zaposlenog"
							disabled
						/>
						<TextField
							sx={{ m: 2 }}
							key={"prijava-prezime-zaposlenog"}
							value={zaposleniData?.prezime || "/"}
							label="Prezime zaposlenog"
							disabled
						/>
						<TextField
							sx={{ m: 2 }}
							key={"prijava-telefon-zaposlenog"}
							value={zaposleniData?.telefon || "/"}
							label="Telefon zaposlenog"
							disabled
						/>
						<TextField
							sx={{ m: 2 }}
							key={"prijava-email-zaposlenog"}
							value={zaposleniData?.e_mail || "/"}
							label="Email zaposlenog"
							disabled
						/>
					</Grid>

					<Grid size={12}>
						<FormControl sx={{ m: 2 }}>
							<FormLabel id="demo-radio-buttons-group-label">
								Prisustvo
							</FormLabel>
							<RadioGroup
								aria-labelledby="demo-radio-buttons-group-label"
								defaultValue="online"
								name="radio-buttons-group"
								onChange={(e) =>
									setPrisustvo(
										e.target.value as "online" | "offline" | "ne znam",
									)
								}
							>
								<FormControlLabel
									value="online"
									control={<Radio />}
									label="Online"
								/>
								<FormControlLabel
									value="offline"
									control={<Radio />}
									label="Offline"
								/>
								<FormControlLabel
									value="ne znam"
									control={<Radio />}
									label="Ne znam"
								/>
							</RadioGroup>
						</FormControl>
						<Autocomplete
							disablePortal
							options={seminari || []}
							getOptionLabel={(option) => `${option.datum} - ${option.naziv}`}
							renderOption={(params, option) => (
								<Box component="li" {...params} key={option._id}>
									<Box>
										<Typography variant="caption" display="block">
											{option.datum?.toString()}
										</Typography>
										<Typography variant="body1" sx={{ pl: 3 }}>
											{option.naziv}
										</Typography>
									</Box>
								</Box>
							)}
							renderInput={(params) => (
								<TextField {...params} label="Seminar" />
							)}
							onChange={(_, value) => setSelectedSeminar(value?._id || "")}
						/>
					</Grid>
				</Grid>
			</DialogContent>
			{prijavaFailed && (
				<Alert severity="error" sx={{ m: 2 }}>
					Neuspešno čuvanje prijave na seminar
				</Alert>
			)}
			<DialogActions>
				<Button variant="contained" color="success" onClick={handleSavePrijava}>
					Sačuvaj prijavu
				</Button>
				<Button onClick={onClose} variant="outlined" color="error">
					Napusti
				</Button>
			</DialogActions>
		</Dialog>
	);
}
