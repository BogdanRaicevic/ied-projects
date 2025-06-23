import {
	Box,
	TableContainer,
	Paper,
	Table,
	TableHead,
	TableRow,
	TableCell,
	TableBody,
	TextField,
	Typography,
} from "@mui/material";
import { useRacunStore } from "../store/useRacunStore";

export const OfflinePrisustvaSection = () => {
	const racunData = useRacunStore((state) => state.racunData);
	const updateNestedField = useRacunStore((state) => state.updateNestedField);

	return (
		<Box>
			<Typography align="center" variant="h4" sx={{ mb: 3 }}>
				Prisustva u sali
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
								<TableCell>Seminar</TableCell>
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
									<TextField
										variant="filled"
										name="naziv"
										value={racunData.seminar.naziv ?? ""}
										onChange={(e) =>
											updateNestedField("seminar.naziv", e.target.value)
										}
									/>
								</TableCell>
								<TableCell align="left">
									<TextField
										variant="filled"
										name="jedinicaMere"
										value={racunData.seminar.jedinicaMere || ""}
										onChange={(e) =>
											updateNestedField("seminar.jedinicaMere", e.target.value)
										}
									/>
								</TableCell>
								<TableCell align="left">
									<TextField
										variant="filled"
										name="brojUcesnikaOffline"
										value={racunData.seminar.brojUcesnikaOffline || 0}
										onChange={(e) =>
											updateNestedField(
												"seminar.brojUcesnikaOffline",
												Number(e.target.value),
											)
										}
									/>
								</TableCell>
							</TableRow>
						</TableBody>
					</Table>
					<Table sx={{ minWidth: 650 }} aria-label="simple table">
						<TableHead>
							<TableRow>
								<TableCell>Cena offline</TableCell>
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
									<TextField
										sx={{ maxWidth: 100 }}
										name="offlineCena"
										variant="filled"
										value={racunData.seminar.offlineCena || 0}
										onChange={(e) =>
											updateNestedField(
												"seminar.offlineCena",
												Number(e.target.value),
											)
										}
									/>
								</TableCell>
								<TableCell align="left">
									<TextField
										sx={{ maxWidth: 70 }}
										name="popustOffline"
										variant="filled"
										value={racunData.calculations.popustOffline || 0}
										onChange={(e) => {
											const value = e.target.value;
											if (value === "" || /^\d*\.?\d*$/.test(value)) {
												const numValue = parseFloat(value);
												if (
													value === "" ||
													(!isNaN(numValue) && numValue >= 0 && numValue <= 100)
												) {
													updateNestedField(
														"calculations.popustOffline",
														value === "" ? 0 : numValue,
													);
												}
											}
										}}
									/>
								</TableCell>
								<TableCell align="left">
									<Typography>
										{Number(
											racunData.calculations.offlinePoreskaOsnovica,
										).toLocaleString("sr-RS", {
											style: "currency",
											currency: "RSD",
											minimumFractionDigits: 2,
										})}
									</Typography>
								</TableCell>
								<TableCell align="left">
									<Typography>{racunData.stopaPdv}%</Typography>
								</TableCell>
								<TableCell align="left">
									<Typography>
										{Number(racunData.calculations.pdvOffline).toLocaleString(
											"sr-RS",
											{
												style: "currency",
												currency: "RSD",
												minimumFractionDigits: 2,
											},
										)}
									</Typography>
								</TableCell>
								<TableCell align="left">
									<Typography>
										{Number(
											racunData.calculations.offlineUkupnaNaknada,
										).toLocaleString("sr-RS", {
											style: "currency",
											currency: "RSD",
											minimumFractionDigits: 2,
										})}
									</Typography>
								</TableCell>
							</TableRow>
						</TableBody>
					</Table>
				</TableContainer>
			</Box>
		</Box>
	);
};
