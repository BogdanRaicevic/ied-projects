import { Grid, TextField, Autocomplete, Typography } from "@mui/material";
import { tipoviSeminara } from "../../fakeData/seminarsData";

type SingleSeminar = {
  id: string;
  naziv: string;
  datum: string;
  predavac: string;
  tipSeminara: string;
  maloprodajnaCena: number;
  mesto: string;
  ucesnici: {
    naziv: string;
    id: string;
    zaposleni: {
      id: string;
      ime: string;
      prezime: string;
      email: string;
    }[];
  }[];
};

export function EssentialSeminarData(item: SingleSeminar) {
  const countZaposleni = (seminar: any) => {
    let count = 0;
    seminar.ucesnici.forEach((ucesnik: any) => {
      count += ucesnik.zaposleni.length;
    });
    return count;
  };

  return (
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
        <Typography sx={{ m: 1, p: 1, fontSize: "1.5em" }} id="broj-firmi">
          Broj Firmi: {item.ucesnici.length}
        </Typography>
      </Grid>

      <Grid xs={3}>
        <Typography sx={{ m: 1, p: 1, fontSize: "1.5em" }} id="broj-ucesnika">
          Broj Ucesnika: {countZaposleni(item)}
        </Typography>
      </Grid>
    </Grid>
  );
}
