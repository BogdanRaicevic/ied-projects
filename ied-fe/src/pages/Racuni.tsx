import {
	Grid2,
	Typography,
	Divider,
	Table,
	TableHead,
	TableBody,
	TableRow,
	Paper,
	TableCell,
	TableContainer,
	Box,
} from "@mui/material";
import PageTitle from "../components/PageTitle";
import iedLogo from "../../public/ied-logo-2.png";

export default function Racuni() {
	return (
		<>
			<PageTitle title={"Racuni"} />

			<Grid2 container>
				<Grid2 component={Paper} size={12} container>
					<Grid2 size={7}>
						<Box sx={{ padding: "1rem" }}>
							<Typography>
								Institut za ekonomsku diplomatiju d.o.o, 11080 Zemun, Pregrevica
								168,
							</Typography>
							<Typography>Kontakt telefoni: 011/3077612, 3077612</Typography>
							<Typography>PIB:SR103159254; Matični broj: 17518313;</Typography>
							<Typography>
								Broj rešenja o evidenciji za PDV kod Ministarstva finansija
								Republike Srbije: 134107598;
							</Typography>
							<Typography>
								Tekući račun: 170-0030035229000-87 (UniCredit Banka)
							</Typography>
						</Box>
					</Grid2>
					<Grid2 size={5}>
						<Box
							sx={{
								display: "flex",
								justifyContent: "center",
								alignItems: "center",
								height: "100%",
								p: 1,
							}}
						>
							<img
								src={iedLogo}
								alt="institut za ekonomsku diplomatiju"
								style={{ maxWidth: "100%", maxHeight: "100%" }}
							/>
						</Box>
					</Grid2>
				</Grid2>
				<Grid2 size={12}>
					<Divider sx={{ mt: 3, mb: 3 }} />
					<Box>
						<TableContainer component={Paper}>
							<Table sx={{ minWidth: 650 }} aria-label="simple table">
								<TableHead>
									<TableRow>
										<TableCell>Primalac računa</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									<TableRow
										key="naziv-firme"
										sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
									>
										<TableCell align="left">
											<Typography>Naziv: </Typography>
											<Typography>Adresa: </Typography>
											<Typography>PIB: </Typography>
										</TableCell>
									</TableRow>
								</TableBody>
							</Table>
						</TableContainer>
					</Box>
					<Divider sx={{ mt: 3, mb: 3 }} />
					<Typography align="center" variant="h4" sx={{ mb: 3 }}>
						PREDRAČUN BROJ:{" "}
					</Typography>
					<Box sx={{ mb: 3 }}>
						<TableContainer component={Paper}>
							<Table
								sx={{
									border: 0,
									borderBottom: 1,
									borderStyle: "dashed",
									mb: 3,
								}}
								aria-label="simple table"
							>
								<TableHead>
									<TableRow>
										<TableCell>Vrsta usluge</TableCell>
										<TableCell>Jedinica mere</TableCell>
										<TableCell>Količina</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									<TableRow
										key="naziv-firme"
										sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
									>
										<TableCell align="left">
											<Typography>Naziv seminara: </Typography>
										</TableCell>
										<TableCell align="left">
											<Typography>Broj učesnika</Typography>
										</TableCell>
										<TableCell align="left">
											<Typography>1</Typography>
										</TableCell>
									</TableRow>
								</TableBody>
							</Table>
							<Table sx={{ minWidth: 650 }} aria-label="simple table">
								<TableHead>
									<TableRow>
										<TableCell>Cena po jedinici</TableCell>
										<TableCell>Popust</TableCell>
										<TableCell>Poreska osnovica</TableCell>
										<TableCell>Stopa PDV</TableCell>
										<TableCell>PDV</TableCell>
										<TableCell>Ukupna naknada</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									<TableRow
										key="naziv-firme"
										sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
									>
										<TableCell align="left">
											<Typography>15.000</Typography>
										</TableCell>
										<TableCell align="left">
											<Typography>15%</Typography>
										</TableCell>
										<TableCell align="left">
											<Typography>25.000</Typography>
										</TableCell>
										<TableCell align="left">
											<Typography>20%</Typography>
										</TableCell>
										<TableCell align="left">
											<Typography>5000</Typography>
										</TableCell>
										<TableCell align="left">
											<Typography>31000</Typography>
										</TableCell>
									</TableRow>
								</TableBody>
							</Table>
						</TableContainer>
					</Box>
					<Box>
						<Typography align="right" variant="h6">
							Napomena o poreskom
							oslobađanju:__/__________________________________
						</Typography>
						<Typography align="right" variant="h6">
							Rok za uplatu: 5 dana
						</Typography>
						<Typography align="right" variant="h6">
							Poziv na broj: 838/23
						</Typography>
					</Box>
					<Divider sx={{ mt: 3 }} />
					<Typography align="center" variant="h6" sx={{ mb: 3 }}>
						PREDRAČUN JE URAĐEN U ELEKTRONSKOJ FORMI I VAŽI BEZ PEČATA I
						POTPISA.
					</Typography>
					<Typography align="center" variant="h6" sx={{ mb: 3 }}>
						Mesto i datum izdavanja predračuna: Beograd, 31/10/2023
					</Typography>
				</Grid2>
			</Grid2>
		</>
	);
}
