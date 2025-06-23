import { SetStateAction, useState } from "react";
import List from "@mui/material/List";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Pagination from "@mui/material/Pagination";
import {
	Card,
	CardContent,
	Typography,
	Accordion,
	AccordionDetails,
	AccordionSummary,
} from "@mui/material";
import { fakeZaposleni } from "../../fakeData/zaposleniPretraga";
import { SingleZaposleni } from "../Zaposleni/SingleZaposleni";

const itemsPerPage = 5;

function PaginatedList() {
	const [page, setPage] = useState(1);

	const handleChange = (_event: any, value: SetStateAction<number>) => {
		setPage(value);
	};

	type Zaposleni = {
		ime: string;
		prezime: string;
		email: string;
		brojSertifikata?: string;
		komentari?: string;
		radnaMesta: string[];
		id: string;
		seminari?: Seminar_Zaposleni[];
		telefon: string;
		zeleMarketingMaterijal: boolean;
	};

	type Seminar_Zaposleni = {
		naziv: string;
		predavac: string;
		datum: string;
		id: string;
	};

	const renderZaposleni = (zaposleni: Zaposleni[]) => {
		return zaposleni.map((z: Zaposleni, index: number) => (
			<SingleZaposleni key={index} {...z} />
		));
	};

	return (
		<div>
			<List>
				{fakeZaposleni
					.slice((page - 1) * itemsPerPage, page * itemsPerPage)
					.map((item, index) => (
						<Card key={index} sx={{ mb: 1 }}>
							<CardContent sx={{ backgroundColor: "#ead5d3" }}>
								<Typography variant="h6" component="div">
									{item.firma.naziv}{" "}
									{/* Replace with your company name variable */}
								</Typography>
								<Typography variant="body2" color="text.secondary">
									{"PIB: " + item.firma.pib}{" "}
									{/* Replace with your company id variable */}
								</Typography>
								<Accordion>
									<AccordionSummary
										expandIcon={<ExpandMoreIcon />}
										aria-controls="panel1a-content"
										id="panel1a-header"
									>
										<Typography>
											Broj zaposlenih: {item.firma.zaposleni.length}
										</Typography>
									</AccordionSummary>
									<AccordionDetails>
										{renderZaposleni(item.firma.zaposleni)}
									</AccordionDetails>
								</Accordion>
							</CardContent>
						</Card>
					))}
			</List>
			<Pagination
				sx={{ mb: 5 }}
				count={Math.ceil(fakeZaposleni.length / itemsPerPage)}
				page={page}
				onChange={handleChange}
			/>
		</div>
	);
}

export default PaginatedList;
