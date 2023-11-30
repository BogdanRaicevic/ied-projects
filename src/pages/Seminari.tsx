import { UnfoldLess } from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  List,
  ListItem,
  Pagination,
  TextField,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { fakeSeminarsOnSeminar, tipoviSeminara } from "../fakeData/seminarsData";
import { SetStateAction, useState } from "react";
import Grid from "@mui/system/Unstable_Grid";

export default function () {
  const parametriPretrage = () => (
    <Box>
      <h1>Parametri Pretrage</h1>
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
  );

  const [page, setPage] = useState(1);

  const handleChange = (_event: any, value: SetStateAction<number>) => {
    setPage(value);
  };
  const itemsPerPage = 5;
  const items = fakeSeminarsOnSeminar;

  const renderUcesnikeZaposlene = (firmaUcesnik: any) => {
    const a = firmaUcesnik.zaposleni.map((zaposleni: any, index: number) => {
      return (
        <List key={index}>
          <ListItem>
            <Typography>{zaposleni.ime + " " + zaposleni.prezime}</Typography>
            <Typography sx={{ paddingLeft: 10 }}>{zaposleni.email}</Typography>
          </ListItem>
        </List>
      );
    });

    return a;
  };
  const seminariLista = () => (
    <div>
      <List>
        {items.slice((page - 1) * itemsPerPage, page * itemsPerPage).map((item, index) => (
          // <ListItem key={index}>{item}</ListItem>
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
                  <Grid container spacing={2}>
                    <Grid xs={3}>
                      <TextField
                        sx={{ m: 1 }}
                        id="naziv"
                        label="Naziv"
                        variant="outlined"
                        defaultValue={item.naziv}
                      />
                    </Grid>
                    <Grid xs={3}>
                      <TextField
                        sx={{ m: 1 }}
                        id="datum"
                        label="Datum"
                        variant="outlined"
                        defaultValue={item.datum}
                      />
                    </Grid>
                    <Grid xs={3}>
                      <TextField
                        sx={{ m: 1 }}
                        id="predavac"
                        label="Predavac"
                        variant="outlined"
                        defaultValue={item.predavac}
                      />
                    </Grid>
                    <Grid xs={3}>
                      <TextField
                        sx={{ m: 1 }}
                        id="mesto"
                        label="Mesto odrazavanja"
                        variant="outlined"
                        defaultValue={item.mesto}
                      />
                    </Grid>
                    <Grid xs={3}>
                      <TextField
                        sx={{ m: 1 }}
                        id="osnovna-cena"
                        label="Osnovna cena"
                        variant="outlined"
                        defaultValue={item.maloprodajnaCena}
                      />
                    </Grid>
                    <Grid xs={3}>
                      <Autocomplete
                        sx={{ m: 1 }}
                        disablePortal
                        id="tipovi-seminara"
                        options={tipoviSeminara}
                        defaultValue={item.tipSeminara}
                        renderInput={(params) => <TextField {...params} label="Tipovi Seminara" />}
                      />
                    </Grid>
                    <Grid xs={3}>
                      <TextField
                        sx={{ m: 1 }}
                        id="broj-firmi"
                        label="Broj firmi"
                        variant="outlined"
                        defaultValue={item.ucesnici.length}
                        disabled
                      />
                    </Grid>

                    <Grid xs={3}>
                      <TextField
                        sx={{ m: 1 }}
                        id="broj-ucesnika"
                        label="Broj ucesnika"
                        variant="outlined"
                        defaultValue={countZaposleni(item)}
                        disabled
                      />
                    </Grid>
                  </Grid>
                  <Card sx={{ mt: 4 }}>
                    <CardContent>
                      <Typography>Ucesnici</Typography>
                      {item.ucesnici.map((ucesnik: any, index: number) => {
                        return (
                          <List key={index}>
                            <Box>
                              <Typography>{ucesnik.naziv}</Typography>
                              {renderUcesnikeZaposlene(ucesnik)}
                            </Box>
                          </List>
                        );
                      })}
                      <List>
                        <ListItem>
                          <Card>
                            <Typography></Typography>
                          </Card>
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
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

  const countZaposleni = (seminar: any) => {
    let count = 0;
    seminar.ucesnici.forEach((ucesnik: any) => {
      count += ucesnik.zaposleni.length;
    });
    return count;
  };

  return (
    <>
      {parametriPretrage()}
      <Button sx={{ m: 1 }} size="large" variant="contained" color="info" type="submit">
        Pretrazi
      </Button>
      <h2>Seminari</h2>
      {seminariLista()}
    </>
  );
}
