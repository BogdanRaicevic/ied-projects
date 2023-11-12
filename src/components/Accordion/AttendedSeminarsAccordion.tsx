import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AttendeesList from "../AttendeesList";
import { compareDesc, parse } from "date-fns";
import { useState, useEffect } from "react";
import { Button, Container } from "@mui/material";

type Seminar = {
  naziv: string;
  datum: string;
  ucesnici: string[];
};

export default function AttendedSeminarsAccordion(props: { seminari: Seminar[] }) {
  const [expanded, setExpanded] = useState<string | false>(false);

  useEffect(() => {
    if (props.seminari.length > 0) {
      setExpanded(props.seminari[0].naziv);
    }
  }, [props.seminari]);

  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  // TODO: find out why the data is logged twice
  console.log("props : ", props.seminari);

  const formatDate = (date: string) => {
    const parsedDate = parse(date, "yyyy-MM-dd", new Date());
    return parsedDate;
  };

  const attendedSeminars = props.seminari
    .sort((a, b) => compareDesc(formatDate(a.datum), formatDate(b.datum)))
    .map((seminar: Seminar) => {
      return (
        <Accordion
          key={seminar.datum + seminar.naziv}
          expanded={expanded === seminar.naziv}
          onChange={handleChange(seminar.naziv)}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ justifyContent: "space-between" }}>
            <Container>
              <Typography sx={{ width: "33%", flexShrink: 0 }}>Datum: {seminar.datum}</Typography>
              <Typography sx={{ flexShrink: 0 }}>Naziv: {seminar.naziv} </Typography>
            </Container>
            <Button
              variant="contained"
              color="primary"
              size="small"
              sx={{ flexShrink: 0, mr: 2 }}
              onClick={(event) => {
                event.stopPropagation(); // Prevents the accordion from expanding/collapsing
                // Handle button click
              }}
            >
              Generiši dokument
            </Button>
          </AccordionSummary>
          <AccordionDetails>
            <AttendeesList ucesnici={seminar.ucesnici}></AttendeesList>
          </AccordionDetails>
        </Accordion>
      );
    });

  return (
    <div style={{ marginTop: "2em", marginBottom: "4em" }}>
      <h2>Posećeni Seminari: </h2>
      {attendedSeminars}
    </div>
  );
}
