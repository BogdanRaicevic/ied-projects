// import Accordion from "@mui/material/Accordion";
// import AccordionDetails from "@mui/material/AccordionDetails";
// import AccordionSummary from "@mui/material/AccordionSummary";
// import Typography from "@mui/material/Typography";
// import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
// import AttendeesList from "../AttendeesList";
// import { compareDesc, parse } from "date-fns";
// import { useState, useEffect } from "react";
// import { Button, Container } from "@mui/material";
// import { Firma } from "../../schemas/companySchemas";

// type Seminar = {
// 	naziv: string;
// 	datum: string;
// 	ucesnici: string[];
// };

//{ firma }: { firma: Firma }
export default function AttendedSeminarsAccordion() {
	// const [expanded, setExpanded] = useState<string | false>(false);
	// const handleChange =
	// 	(panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
	// 		setExpanded(isExpanded ? panel : false);
	// 	};
	// // TODO: find out why the data is logged twice
	// console.log("Accordion PROPS : ", firma);
	// const formatDate = (date: string) => {
	// 	const parsedDate = parse(date, "yyyy-MM-dd", new Date());
	// 	return parsedDate;
	// };
	// // const handleAddSeminar = (seminarId: string) => {
	// //   const selectedSEminar = { naziv: "test", datum: "2022-01-01" };
	// //   if (firma.seminari.find((seminar) => seminar.naziv === selectedSEminar?.naziv)) {
	// //     alert("Seminar je vec dodat!");
	// //     return;
	// //   }
	// //   if (selectedSEminar) {
	// //     firma.seminari.push({
	// //       naziv: selectedSEminar.naziv,
	// //       datum: selectedSEminar.datum,
	// //       ucesnici: [],
	// //     });
	// //     setExpanded(selectedSEminar.naziv);
	// //   }
	// // };
	// const handleRemoveSeminar = (seminar: Seminar) => {
	// 	const index = firma.seminari.indexOf(seminar);
	// 	firma.seminari.splice(index, 1);
	// 	setExpanded(firma.seminari[0].naziv);
	// };
	// const attendedSeminars = firma.seminari
	// 	?.sort((a, b) => compareDesc(formatDate(a.datum), formatDate(b.datum)))
	// 	.map((seminar: Seminar) => {
	// 		return (
	// 			<Accordion
	// 				key={seminar.datum + seminar.naziv}
	// 				expanded={expanded === seminar.naziv}
	// 				onChange={handleChange(seminar.naziv)}
	// 			>
	// 				<AccordionSummary
	// 					expandIcon={<ExpandMoreIcon />}
	// 					sx={{ justifyContent: "space-between" }}
	// 				>
	// 					<Container>
	// 						<Typography sx={{ width: "33%", flexShrink: 0 }}>
	// 							Datum: {seminar.datum}
	// 						</Typography>
	// 						<Typography sx={{ flexShrink: 0 }}>
	// 							Naziv: {seminar.naziv}{" "}
	// 						</Typography>
	// 					</Container>
	// 					<Button
	// 						variant="contained"
	// 						color="primary"
	// 						size="small"
	// 						sx={{ flexShrink: 0, mr: 2 }}
	// 						onClick={(event) => {
	// 							event.stopPropagation(); // Prevents the accordion from expanding/collapsing
	// 							// Handle button click
	// 						}}
	// 					>
	// 						Generiši dokument
	// 					</Button>
	// 					<Button
	// 						variant="outlined"
	// 						color="warning"
	// 						size="small"
	// 						onClick={(event) => {
	// 							event.stopPropagation(); // Prevents the accordion from expanding/collapsing
	// 							if (
	// 								window.confirm(
	// 									"Da li ste sigurni da zelite da obriste seminar?",
	// 								)
	// 							) {
	// 								handleRemoveSeminar(seminar);
	// 							}
	// 						}}
	// 					>
	// 						Obrisi Seminar
	// 					</Button>
	// 				</AccordionSummary>
	// 				<AccordionDetails>
	// 					<AttendeesList
	// 						ucesnici={seminar.ucesnici}
	// 						zaposleni={firma.zaposleni}
	// 					></AttendeesList>
	// 				</AccordionDetails>
	// 			</Accordion>
	// 		);
	// 	});
	// return (
	// 	<div style={{ marginTop: "2em", marginBottom: "4em" }}>
	// 		{/* <SelectSeminar onSeminarSelect={handleAddSeminar}></SelectSeminar> */}
	// 		<h2>Posećeni Seminari: </h2>
	// 		{attendedSeminars}
	// 	</div>
	// );
}
