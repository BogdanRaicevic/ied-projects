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
} from "@mui/material";
import { Grid } from "@mui/system";
import { useFetchSeminari } from "../../hooks/useFetchData";
import type { Company, Zaposleni } from "../../schemas/companySchemas";
import { type PrijavaNaSeminar, savePrijava } from "../../api/seminari.api";

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
	const handleSavePrijava = () => {
		const prijava: PrijavaNaSeminar = {
			seminar_id: "67705211997933047a255d14", // TODO: get from autocomplete
			firma_id: companyData?._id ?? "",
			firma_naziv: companyData?.naziv_firme ?? "",
			firma_email: companyData?.e_mail ?? "",
			firma_telefon: companyData?.telefon ?? "",
			zaposleni_id: zaposleniData?._id ?? "",
			zaposleni_ime: zaposleniData?.ime ?? "",
			zaposleni_prezime: zaposleniData?.prezime ?? "",
			zaposleni_email: zaposleniData?.e_mail ?? "",
			zaposleni_telefon: zaposleniData?.telefon ?? "",
			prisustvo: "online", // TODO: get from radiobutton
		};
		savePrijava(prijava);
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
											{option.datum}
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
						/>
					</Grid>
				</Grid>
			</DialogContent>
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
