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

export default function PrijaveSeminarTable({ prijave }: { prijave: any[] }) {
	const [open, setOpen] = useState(false);
	return (
		<>
			<TableRow>
				<TableCell>
					<IconButton
						aria-label="expand row"
						size="small"
						onClick={() => setOpen(!open)}
					>
						{open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
					</IconButton>
				</TableCell>
				<TableCell>{prijave[0].naziv_firme}</TableCell>
				<TableCell>{prijave[0].email_firme}</TableCell>
				<TableCell>{prijave[0].telefon_firme}</TableCell>
				<TableCell>{prijave.length}</TableCell>
			</TableRow>
			<TableRow key={prijave[0].id_firme}>
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
									{prijave.map((entry) => (
										<TableRow key={entry.id_zaposlenog}>
											<TableCell>{entry.ime_zaposlenog}</TableCell>
											<TableCell>{entry.prezime_zaposlenog}</TableCell>
											<TableCell>{entry.email_zaposlenog}</TableCell>
											<TableCell>{entry.telefon_zaposlenog}</TableCell>
											<TableCell>{entry.prisustvo}</TableCell>
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
