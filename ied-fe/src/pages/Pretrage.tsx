import MyTable from "../components/MyTable";
import PageTitle from "../components/PageTitle";
import IndeterminateCheckbox from "../components/IndeterminateCheckbox";
import Grid from "@mui/material/Unstable_Grid2";
import { Button, TextField } from "@mui/material";
import { Box } from "@mui/system";
import SaveDataButton from "../components/SaveDataButton/SaveDataButton";
import CheckboxList from "../components/CheckboxList/CheckboxList";
import { useEffect, useState } from "react";
import { fetchAllVelicineFirme } from "../api/velicina_firme.api";
import { fetchAllRadnaMesta } from "../api/radna_mesto.api";

export default function Pretrage() {
  const [velicineFirmi, setVelicineFirmi] = useState<string[]>([]);
  const [radnaMesta, setRadnaMesta] = useState<string[]>([]);

  const gradovi = [
    { parent: "SVI Gradovi" },
    {
      parent: "Aleksinac",
      children: ["Aleksinacki rudnik", "Loćika", "Subotinac", "Trnjane"],
    },
    {
      parent: "Aleksandrovac",
      children: ["Gornji Stupanj", "Tranavci", "Sljivovo"],
    },
    {
      parent: "Beograd",
      children: [
        "Novi Beograd",
        "Zemun",
        "Borca",
        "Palilula",
        "Vozdovac",
        "Rakovica",
        "Zvezdara",
        "Savski venac",
        "Stari grad",
        "Cukarica",
        "Vracar",
      ],
    },
  ];

  const delatnosti = [
    {
      parent: "Delatnost",
      children: [
        "Advokati",
        "Arhiv",
        "Banke",
        "Proizvodnja",
        "Trgovina",
        "Usluge",
        "Saobracaj",
        "Poljoprivreda",
        "Građevinarstvo",
        "Turizam",
        "IT",
      ],
    },
  ];

  const tipoviFirmi = [
    {
      parent: "Tip firme",
      children: ["Doo", "Ado", "jkp", "inostranstvo", "jp", "Nvo", "Ad", "Ostalo"],
    },
  ];

  // merge this into one array
  const arrayNames = ["gradovi", "delatnosti", "tipoviFirmi"];
  const arrays = [gradovi, delatnosti, tipoviFirmi];

  const components = arrays.map((array, index) => {
    return (
      <Grid key={arrayNames[index]} xs={12} sm={2}>
        <div style={{ maxHeight: "300px", overflow: "auto" }}>
          {array.map((item, index) => (
            <IndeterminateCheckbox key={arrayNames[index]} options={item} />
          ))}
        </div>
      </Grid>
    );
  });

  useEffect(() => {
    const fetchData = async () => {
      const velicineFirme = await fetchAllVelicineFirme();
      setVelicineFirmi(velicineFirme);

      const radnaMesta = await fetchAllRadnaMesta();
      setRadnaMesta(radnaMesta);
    };

    fetchData();
  }, []);

  return (
    <>
      <PageTitle title={"Pretrage"} />
      <Grid container spacing={2}>
        {components}
      </Grid>

      <CheckboxList data={velicineFirmi} subheader="Veličine Firmi"></CheckboxList>
      <CheckboxList data={radnaMesta} subheader="Radna Mesta"></CheckboxList>

      <SaveDataButton
        exportSubject="firma"
        fileName="pretrage_firma"
        // TODO: fix hardcoded query params
        queryParameters={{ pib: "101", delatnost: "Prehrambena industrija" }}
      ></SaveDataButton>
      <SaveDataButton
        exportSubject="zaposleni"
        fileName="pretrage_zaposleni"
        // TODO: fix hardcoded query params
        queryParameters={{ pib: "101", delatnost: "Prehrambena industrija" }}
      ></SaveDataButton>
      <Box
        component="form"
        sx={{
          "& .MuiTextField-root": { m: 1, width: "25ch" },
        }}
        noValidate
        autoComplete="off"
      >
        <Grid mt={4} maxWidth="lg">
          <TextField label="Ime Firme" />
          <TextField label="PIB / Matični broj" />
          <TextField label="Domen / email" />
          <TextField label="Mesto" />
        </Grid>
        <Button variant="contained" sx={{ m: 1, mb: 4 }} size="large" color="info">
          Pretrazi
        </Button>
      </Box>
      <MyTable></MyTable>
    </>
  );
}
