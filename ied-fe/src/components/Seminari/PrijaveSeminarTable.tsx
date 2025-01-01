import {
	TableRow,
	TableCell,
	IconButton,
	Collapse,
	Typography,
	Table,
	TableHead,
	TableBody,
} from "@mui/material";
import { Box } from "@mui/system";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { useState } from "react";
import type { PrijavaNaSeminar } from "../../schemas/companySchemas";

export default function PrijaveSeminarTable({
	prijave,
}: { prijave: Omit<PrijavaNaSeminar, "seminar_id">[] }) {
	const [open, setOpen] = useState(false);
	return (
		<>
			<TableRow sx={{ backgroundColor: "#95bb9f" }}>
				<TableCell>
					<IconButton
						aria-label="expand row"
						size="small"
						onClick={() => setOpen(!open)}
						disabled={prijave.length === 0}
					>
						{open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
					</IconButton>
				</TableCell>
				<TableCell>{prijave[0].firma_naziv}</TableCell>
				<TableCell>{prijave[0].firma_email}</TableCell>
				<TableCell>{prijave[0].firma_telefon}</TableCell>
				<TableCell>{prijave.length}</TableCell>
			</TableRow>
			<TableRow key={prijave[0].firma_id} sx={{ backgroundColor: "#c8d3c8" }}>
				<TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
					<Collapse in={open} timeout="auto" unmountOnExit>
						<Box sx={{ margin: 1 }}>
							<Typography variant="h6" gutterBottom component="div">
								Prijavljeni
							</Typography>
							<Table size="small" aria-label="prijave">
								<TableHead>
									<TableRow>
										<TableCell>Ime</TableCell>
										<TableCell>Prezime</TableCell>
										<TableCell>Email</TableCell>
										<TableCell>Telefon</TableCell>
										<TableCell>Prisustvo</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{prijave.map((prijava) => (
										<TableRow key={prijava.zaposleni_id}>
											<TableCell>{prijava.zaposleni_ime}</TableCell>
											<TableCell>{prijava.zaposleni_prezime}</TableCell>
											<TableCell>{prijava.zaposleni_email}</TableCell>
											<TableCell>{prijava.zaposleni_telefon}</TableCell>
											<TableCell>{prijava.prisustvo}</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</Box>
					</Collapse>
				</TableCell>
			</TableRow>
		</>
	);
}
