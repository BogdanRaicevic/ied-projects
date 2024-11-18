// import { UnfoldLess } from "@mui/icons-material";
import {
  // Accordion,
  // AccordionDetails,
  // AccordionSummary,
  Box,
  Button,
  // Card,
  // CardContent,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  // List,
  // Pagination,
  TextField,
  // Typography,
} from "@mui/material";
// import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { fakeSeminarsOnSeminar } from "../fakeData/seminarsData";
import { SetStateAction, useState } from "react";
// import { EssentialSeminarData } from "../components/Seminari/EssentialSeminarData";
// import { UcesniciSeminara } from "../components/Seminari/UcesniciSeminara";
import SeminarForm from "../components/Forms/SeminarForm";
import { searchSeminar } from "../api/seminari.api";
import { format } from "date-fns";
import { Seminar } from "../schemas/companySchemas";
import AddSeminarForm from "../components/AlegzSeminari/SeminariInput";
import { UnfoldLess } from "@mui/icons-material";

export default function Seminari() {
  const parametriPretrage = () => (
    <>
      <h1>Parametri Pretrage</h1>
      <Box>
        <TextField
          sx={{ m: 1 }}
          id="predavac"
          label="Predavac"
          variant="outlined"
          defaultValue={predavac}
          onChange={(e) => setPredavac(e.target.value)}
        />
        <TextField
          sx={{ m: 1 }}
          id="naziv"
          label="Naziv seminara"
          variant="outlined"
          defaultValue={naziv}
          onChange={(e) => setNaziv(e.target.value)}
        />
        <TextField
          sx={{ m: 1 }}
          id="lokacija"
          label="Lokacija"
          variant="outlined"
          defaultValue={lokacija}
          onChange={(e) => setLokacija(e.target.value)}
        />
        {/* <TextField sx={{ m: 1 }} id="broj-ucesnika" label="Broj ucesnika" variant="outlined" /> */}
        <FormControl sx={{ m: 1 }}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              format="yyyy/MM/dd"
              label="Pocetni datum"
              name="datumOd"
              defaultValue={datumOd}
              onChange={(date) => setdatumOd(date)}
            />
            <Box display="flex" alignItems="center" justifyContent="center">
              <UnfoldLess />
            </Box>
            <DatePicker
              format="yyyy/MM/dd"
              label="Kranji datum"
              name="datumDo"
              defaultValue={datumDo}
              onChange={(date) => setdatumDo(date)}
            />
          </LocalizationProvider>
        </FormControl>
      </Box>
    </>
  );

  // const [page, setPage] = useState(1);
  const [naziv, setNaziv] = useState("");
  const [predavac, setPredavac] = useState("");
  const [lokacija, setLokacija] = useState("");
  const [datumOd, setdatumOd] = useState<Date | null>(null);
  const [datumDo, setdatumDo] = useState<Date | null>(null);

  // const handleChange = (_event: any, value: SetStateAction<number>) => {
  //   setPage(value);
  // };

  // const itemsPerPage = 5;

  const [seminars, setSeminars] = useState([...fakeSeminarsOnSeminar]);
  const addSeminar = (newSeminar: Seminar) => {
    // TODO: fix any
    setSeminars((prevSeminars): any => {
      return [...prevSeminars, newSeminar];
    });
  };

  const handleSearch = async () => {
    try {
      const searchResults = await searchSeminar(
        naziv,
        predavac,
        lokacija,
        datumOd ? format(datumOd, "yyyy-MM-dd") : null,
        datumDo ? format(datumDo, "yyyy-MM-dd") : null
      );
      console.log("Formatted datumOd:", datumOd ? format(datumOd, "yyyy-MM-dd") : null);
      console.log("Formatted datumDo:", datumDo ? format(datumDo, "yyyy-MM-dd") : null);
      setSeminars(searchResults.data);
    } catch (error) {
      console.error("Error executing search:", error);
    }
  };

  // const [showArchived, setShowArchived] = useState(false);

  // const handleArchivedSeminars = () => {
  //   setShowArchived(!showArchived);
  // };

  // const seminariLista = () => (
  //   <div>
  //     <Button
  //       sx={{ m: 1 }}
  //       size="large"
  //       variant="contained"
  //       color="info"
  //       onClick={handleArchivedSeminars}
  //     >
  //       Prikazi/Sakriji Arhivirane seminare
  //     </Button>

  //     <List>
  //       {seminars.slice((page - 1) * itemsPerPage, page * itemsPerPage).map((seminar, index) => {
  //         if (showArchived && seminar?.arhiviran) {
  //           return null;
  //         }

  //         return (
  //           <Card key={index} sx={{ mb: 1 }}>
  //             <CardContent sx={{ backgroundColor: "#ead5d3" }}>
  //               <Typography variant="h6" component="div">
  //                 {"Seminar: " + seminar.naziv} {/* Replace with your company name variable */}
  //               </Typography>
  //               <Typography variant="body2" color="text.secondary">
  //                 {"Datum: " + format(seminar.datum, "dd.MM.yyyy")}
  //                 {/* Replace with your company id variable */}
  //               </Typography>

  //               <Accordion>
  //                 <AccordionSummary
  //                   expandIcon={<ExpandMoreIcon />}
  //                   aria-controls="panel1a-content"
  //                   id="panel1a-header"
  //                 >
  //                   <Typography>Detalji seminara</Typography>
  //                 </AccordionSummary>
  //                 <AccordionDetails>
  //                   <EssentialSeminarData {...seminar} />
  //                   <UcesniciSeminara {...seminar} />
  //                 </AccordionDetails>
  //               </Accordion>
  //             </CardContent>
  //           </Card>
  //         );
  //       })}
  //     </List>
  //     <Pagination
  //       sx={{ mb: 5 }}
  //       count={Math.ceil(seminars.length / itemsPerPage)}
  //       page={page}
  //       onChange={handleChange}
  //     />
  //   </div>
  // );

  const [open, setOpen] = useState(false);

  // const handleClickOpen = () => {
  //   setOpen(true);
  // };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      {parametriPretrage()}
      <Button
        sx={{ m: 1 }}
        size="large"
        variant="contained"
        color="info"
        type="submit"
        onClick={handleSearch}
      >
        Pretrazi
      </Button>
      {/* <Button
        sx={{ m: 1 }}
        size="large"
        variant="contained"
        color="secondary"
        onClick={handleClickOpen}
      >
        Kreiraj seimnar
      </Button> */}
      <Dialog open={open} onClose={handleClose} maxWidth="lg">
        <DialogTitle>Seminar</DialogTitle>
        <DialogContent>
          <SeminarForm saveOrUpdateSeminar={addSeminar} closeDialog={handleClose}></SeminarForm>
        </DialogContent>
      </Dialog>
      <h2>Seminari</h2>

      {/* {seminariLista()} */}

      <AddSeminarForm />
    </>
  );
}
