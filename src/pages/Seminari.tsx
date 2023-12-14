import { UnfoldLess } from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  List,
  Pagination,
  TextField,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { fakeSeminarsOnSeminar } from "../fakeData/seminarsData";
import { SetStateAction, useState } from "react";
import { EssentialSeminarData } from "../components/Seminari/EssentialSeminarData";
import { UcesniciSeminara } from "../components/Seminari/UcesniciSeminara";
import CreateSeminarForm from "../components/Forms/CreateSeminarForm";

export default function () {
  const parametriPretrage = () => (
    <>
      <h1>Parametri Pretrage</h1>
      <Box>
        <TextField sx={{ m: 1 }} id="predavac" label="Predavac" variant="outlined" />
        <TextField sx={{ m: 1 }} id="naziv" label="Naziv seminara" variant="outlined" />
        <TextField sx={{ m: 1 }} id="tip" label="Tip Seminara" variant="outlined" />
        <TextField sx={{ m: 1 }} id="broj-ucesnika" label="Broj ucesnika" variant="outlined" />
        <FormControl sx={{ m: 1 }}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker format="yyyy/MM/dd" label="Pocetni datum" />
            <Box display="flex" alignItems="center" justifyContent="center">
              <UnfoldLess />
            </Box>
            <DatePicker format="yyyy/MM/dd" label="Kranji datum" />
          </LocalizationProvider>
        </FormControl>
      </Box>
    </>
  );

  const [page, setPage] = useState(1);

  const handleChange = (_event: any, value: SetStateAction<number>) => {
    setPage(value);
  };
  const itemsPerPage = 5;
  const items = fakeSeminarsOnSeminar;

  const seminariLista = () => (
    <div>
      <List>
        {items.slice((page - 1) * itemsPerPage, page * itemsPerPage).map((item, index) => (
          <Card key={index} sx={{ mb: 1 }}>
            <CardContent sx={{ backgroundColor: "#ead5d3" }}>
              <Typography variant="h6" component="div">
                {"Seminar: " + item.naziv} {/* Replace with your company name variable */}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {"Datum: " + item.datum} {/* Replace with your company id variable */}
              </Typography>

              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  <Typography>Ime i prezime zaposlenog: {item.ucesnici[0].naziv}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <EssentialSeminarData {...item} />
                  <UcesniciSeminara {...item} />
                </AccordionDetails>
              </Accordion>
            </CardContent>
          </Card>
        ))}
      </List>
      <Pagination
        sx={{ mb: 5 }}
        count={Math.ceil(items.length / itemsPerPage)}
        page={page}
        onChange={handleChange}
      />
    </div>
  );

  return (
    <>
      {parametriPretrage()}
      <Button sx={{ m: 1 }} size="large" variant="contained" color="info" type="submit">
        Pretrazi
      </Button>
      <Button sx={{ m: 1 }} size="large" variant="contained" color="success" type="submit">
        Kreiraj novi seminar
      </Button>
      <CreateSeminarForm></CreateSeminarForm>
      <h2>Seminari</h2>
      {seminariLista()}
    </>
  );
}
