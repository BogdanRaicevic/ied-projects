import {
	Grid2,
	Paper,
	TextField,
	Divider,
	TableContainer,
	Table,
	TableHead,
	TableRow,
	TableCell,
	TableBody,
	Typography,
	Box,
	InputAdornment,
} from "@mui/material";
import iedLogo from "../../../public/ied-logo-2.png";
import { useState, useEffect } from "react";

type PrimalacRacuna = {
	naziv: string;
	adresa: string;
	pib: number | string;
	maticniBroj: number | string;
	onlineCena: number | string;
	offlineCena: number | string;
	brojUcesnikaOnline: number | string;
	brojUcesnikaOffline: number | string;
	ukupanBrojUcesnika: number | string;
	nazivSeminara?: string;
};

type Racun = PrimalacRacuna & {
	popustOnline: number | string;
	popustOffline: number | string;
	poreskaOsnovica: number | string;
	stopaPdv: number | string;
	pdvOffline: number | string;
	pdvOnline: number | string;
	onlineUkupnaNaknada: number | string;
	offlineUkupnaNaknada: number | string;
	onlinePreskaOsnovica: number | string;
	offlinePreskaOsnovica: number | string;
};

export default function RacunForm({
	primalacRacuna,
}: { primalacRacuna: PrimalacRacuna }) {
	const [racun, setRacun] = useState<Partial<Racun>>({
		naziv: primalacRacuna.naziv || "",
		adresa: primalacRacuna.adresa || "",
		pib: primalacRacuna.pib || "",
		maticniBroj: primalacRacuna.maticniBroj || "",
		onlineCena: primalacRacuna.onlineCena || "",
		offlineCena: primalacRacuna.offlineCena || "",
		brojUcesnikaOnline: primalacRacuna.brojUcesnikaOnline || "",
		brojUcesnikaOffline: primalacRacuna.brojUcesnikaOffline || "",
		ukupanBrojUcesnika: primalacRacuna.ukupanBrojUcesnika || "",
		nazivSeminara: primalacRacuna.nazivSeminara || "",
	});

	// NOTE: this is a workaround to update the form when the data changes
	useEffect(() => {
		setRacun({
			naziv: primalacRacuna.naziv || "",
			adresa: primalacRacuna.adresa || "",
			pib: primalacRacuna.pib || "",
			maticniBroj: primalacRacuna.maticniBroj || "",
			onlineCena: primalacRacuna.onlineCena || "",
			offlineCena: primalacRacuna.offlineCena || "",
			brojUcesnikaOnline: primalacRacuna.brojUcesnikaOnline || "",
			brojUcesnikaOffline: primalacRacuna.brojUcesnikaOffline || "",
			ukupanBrojUcesnika: primalacRacuna.ukupanBrojUcesnika || "",
			nazivSeminara: primalacRacuna.nazivSeminara || "",
			popustOnline: 0,
			popustOffline: 0,
			stopaPdv: 20,
		});
	}, [primalacRacuna]);

	useEffect(() => {
		const onlineCena = Number(racun.onlineCena) || 0;
		const offlineCena = Number(racun.offlineCena) || 0;
		const brojUcesnikaOnline = Number(racun?.brojUcesnikaOnline) || 0;
		const brojUcesnikaOffline = Number(racun?.brojUcesnikaOffline) || 0;
		const popustOnline = Number(racun?.popustOnline) || 0;
		const popustOffline = Number(racun?.popustOffline) || 0;
		const stopaPdv = Number(racun.stopaPdv) || 0;
		console.log(onlineCena, brojUcesnikaOnline, popustOnline, stopaPdv);

		const onlineUkupnaNaknada =
			onlineCena *
			brojUcesnikaOnline *
			(1 - popustOnline / 100) *
			(1 + stopaPdv / 100);

		const offlineUkupnaNaknada =
			offlineCena *
			brojUcesnikaOffline *
			(1 - popustOffline / 100) *
			(1 + stopaPdv / 100);

		const onlinePreskaOsnovica =
			onlineCena * brojUcesnikaOnline * (1 - popustOnline / 100);
		const offlinePreskaOsnovica =
			offlineCena * brojUcesnikaOffline * (1 - popustOffline / 100);

		setRacun((prev) => {
			return {
				...prev,
				onlineUkupnaNaknada: onlineUkupnaNaknada.toFixed(2),
				offlineUkupnaNaknada: offlineUkupnaNaknada.toFixed(2),
				pdvOffline: offlinePreskaOsnovica * (stopaPdv / 100),
				pdvOnline: onlinePreskaOsnovica * (stopaPdv / 100),
				onlinePreskaOsnovica,
				offlinePreskaOsnovica,
			};
		});
	}, [
		racun.onlineCena,
		racun.offlineCena,
		racun.brojUcesnikaOnline,
		racun.brojUcesnikaOffline,
		racun.popustOnline,
		racun.popustOffline,
		racun.stopaPdv,
	]);

	const handleRacunChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		setRacun((prev) => {
			return {
				...prev,
				[e.target.name]: e.target.value,
			};
		});
	};

	return (
		<Grid2 container>
			<Grid2 component={Paper} size={12} container>
				<Grid2 size={7}>
					<Box sx={{ padding: "1rem" }}>
						<TextField
							fullWidth
							variant="filled"
							label="Podaci o izdavaocu računa"
							defaultValue="Institut za ekonomsku diplomatiju d.o.o, 11080 Zemun, Pregrevica 168"
							sx={{ mb: 2 }}
						/>
						<TextField
							fullWidth
							variant="filled"
							label="Kontakt telefoni"
							defaultValue="011/3077612, 3077612"
							sx={{ mb: 2 }}
						/>
						<TextField
							fullWidth
							variant="filled"
							label="PIB"
							defaultValue="SR103159254"
							sx={{ mb: 2 }}
						/>
						<TextField
							fullWidth
							variant="filled"
							label="Matični broj"
							defaultValue="17518313"
							sx={{ mb: 2 }}
						/>
						<TextField
							fullWidth
							variant="filled"
							label="Broj rešenja o evidenciji za PDV"
							defaultValue="134107598"
							sx={{ mb: 2 }}
						/>
						<TextField
							fullWidth
							variant="filled"
							label="Tekući račun"
							defaultValue="170-0030035229000-87 (UniCredit Banka)"
							sx={{ mb: 2 }}
						/>
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
										<TextField
											name="naziv"
											fullWidth
											variant="filled"
											label="Naziv"
											value={racun.naziv}
											sx={{ mb: 2 }}
											onChange={handleRacunChange}
										/>
										<TextField
											name="adresa"
											fullWidth
											variant="filled"
											label="Adresa"
											value={racun.adresa}
											sx={{ mb: 2 }}
											onChange={handleRacunChange}
										/>
										<TextField
											name="pib"
											fullWidth
											variant="filled"
											label="PIB"
											value={racun.pib}
											sx={{ mb: 2 }}
											onChange={handleRacunChange}
										/>
										<TextField
											name="maticniBroj"
											fullWidth
											variant="filled"
											label="Matični broj"
											value={racun.maticniBroj}
											sx={{ mb: 2 }}
											onChange={handleRacunChange}
										/>
									</TableCell>
								</TableRow>
							</TableBody>
						</Table>
					</TableContainer>
				</Box>
				<Divider sx={{ mt: 3, mb: 3 }} />
				<Typography align="center" variant="h4" sx={{ mb: 3 }}>
					Online prisustva
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
										<TextField
											variant="filled"
											name="nazivSeminara"
											value={racun.nazivSeminara}
											onChange={handleRacunChange}
										/>
									</TableCell>
									<TableCell align="left">
										<Typography>Broj učesnika</Typography>
									</TableCell>

									<TableCell align="left">
										<TextField
											variant="filled"
											name="brojUcesnikaOnline"
											value={racun.brojUcesnikaOnline}
											onChange={handleRacunChange}
										/>
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
										<TextField
											sx={{ maxWidth: 100 }}
											name="onlineCena"
											variant="filled"
											value={racun.onlineCena}
											onChange={handleRacunChange}
										/>
									</TableCell>
									<TableCell align="left">
										<TextField
											sx={{ maxWidth: 70 }}
											name="popustOnline"
											variant="filled"
											value={racun.popustOnline}
											onChange={handleRacunChange}
										/>
									</TableCell>
									<TableCell align="left">
										<Typography>{racun.onlinePreskaOsnovica}</Typography>
									</TableCell>
									<TableCell align="left">
										<Typography>{racun.stopaPdv}%</Typography>
									</TableCell>
									<TableCell align="left">
										<Typography>{racun.pdvOnline}</Typography>
									</TableCell>
									<TableCell align="left">
										<Typography>{racun.onlineUkupnaNaknada}</Typography>
									</TableCell>
								</TableRow>
							</TableBody>
						</Table>
					</TableContainer>
				</Box>

				<Typography align="center" variant="h4" sx={{ mb: 3 }}>
					Offline prisustva
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
										<TextField
											variant="filled"
											name="nazivSeminara"
											value={racun.nazivSeminara}
											onChange={handleRacunChange}
										/>
									</TableCell>
									<TableCell align="left">
										<Typography>Broj učesnika</Typography>
									</TableCell>

									<TableCell align="left">
										<TextField
											variant="filled"
											name="brojUcesnikaOffline"
											value={racun.brojUcesnikaOffline}
											onChange={handleRacunChange}
										/>
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
										<TextField
											sx={{ maxWidth: 100 }}
											name="offlineCena"
											variant="filled"
											value={racun.offlineCena}
											onChange={handleRacunChange}
										/>
									</TableCell>
									<TableCell align="left">
										<TextField
											sx={{ maxWidth: 70 }}
											name="popustOffline"
											variant="filled"
											value={racun.popustOffline}
											onChange={handleRacunChange}
										/>
									</TableCell>
									<TableCell align="left">
										<Typography>{racun.offlinePreskaOsnovica}</Typography>
									</TableCell>
									<TableCell align="left">
										<Typography>{racun.stopaPdv}%</Typography>
									</TableCell>
									<TableCell align="left">
										<Typography>{racun.pdvOffline}</Typography>
									</TableCell>
									<TableCell align="left">
										<Typography>{racun.offlineUkupnaNaknada}</Typography>
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
					PREDRAČUN JE URAĐEN U ELEKTRONSKOJ FORMI I VAŽI BEZ PEČATA I POTPISA.
				</Typography>
				<Typography align="center" variant="h6" sx={{ mb: 3 }}>
					Mesto i datum izdavanja predračuna: Beograd, 31/10/2023
				</Typography>
			</Grid2>
		</Grid2>
	);
}
