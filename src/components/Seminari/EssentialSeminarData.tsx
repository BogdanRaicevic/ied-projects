import { Typography } from "@mui/material";
import Grid from "@mui/system/Unstable_Grid";
import CreateSeminarForm from "../Forms/CreateSeminarForm";
import { useState } from "react";

type SingleSeminar = {
  id: string;
  naziv: string;
  datum: Date;
  predavac: string;
  tipSeminara: string;
  osnovnaCena: number;
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
    if (!seminar.ucesnici) return count;
    seminar.ucesnici.forEach((ucesnik: any) => {
      count += ucesnik.zaposleni.length;
    });
    return count;
  };

  const [seminar, setSeminar] = useState(item);

  function updateSeminar(data: any): void {
    setSeminar(data);
  }

  return (
    <Grid container spacing={2}>
      <CreateSeminarForm
        seminarData={seminar}
        saveOrUpdateSeminar={updateSeminar}
      ></CreateSeminarForm>
      <Grid xs={3}>
        <Typography sx={{ m: 1, p: 1, fontSize: "1.5em" }} id="broj-firmi">
          Broj Firmi: {seminar.ucesnici?.length || 0}
        </Typography>
      </Grid>

      <Grid xs={3}>
        <Typography sx={{ m: 1, p: 1, fontSize: "1.5em" }} id="broj-ucesnika">
          Broj Ucesnika: {countZaposleni(seminar)}
        </Typography>
      </Grid>
    </Grid>
  );
}
