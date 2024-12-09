import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  TextField,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { useState } from "react";
import SeminarForm from "../components/Forms/SeminarForm";
import { format } from "date-fns";
import { Seminar } from "../schemas/companySchemas";
import AddSeminarForm from "../components/AlegzSeminari/SeminariInput";
import { UnfoldLess } from "@mui/icons-material";
import SeminariTable from "../components/Seminari/SeminariTable";

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
      </Box>
    </>
  );

  const [naziv, setNaziv] = useState("");
  const [predavac, setPredavac] = useState("");
  const [lokacija, setLokacija] = useState("");
  const [datumOd, setdatumOd] = useState<Date | null>(null);
  const [datumDo, setdatumDo] = useState<Date | null>(null);
  const [queryParameters, setQueryParameters] = useState({
    naziv: "",
    predavac: "",
    lokacija: "",
    datumOd: null as Date | string | null,
    datumDo: null as Date | string | null,
  });

  const addSeminar = (newSeminar: Seminar) => {
    // TODO: fix any
    console.log("newSeminar", newSeminar);
  };

  const handleSearch = () => {
    setQueryParameters({
      naziv,
      predavac,
      lokacija,
      datumOd: datumOd ? format(datumOd, "yyyy-MM-dd") : null,
      datumDo: datumDo ? format(datumDo, "yyyy-MM-dd") : null,
    });
  };

  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      {parametriPretrage()}

      <Dialog open={open} onClose={handleClose} maxWidth="lg">
        <DialogTitle>Seminar</DialogTitle>
        <DialogContent>
          <SeminarForm saveOrUpdateSeminar={addSeminar} closeDialog={handleClose}></SeminarForm>
        </DialogContent>
      </Dialog>

      <SeminariTable queryParameters={queryParameters}></SeminariTable>

      <AddSeminarForm />
    </>
  );
}
