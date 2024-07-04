import MyTable from "../components/MyTable";
import PageTitle from "../components/PageTitle";
// import IndeterminateCheckbox from "../components/IndeterminateCheckbox";
import Grid from "@mui/material/Unstable_Grid2";
import { Button, TextField } from "@mui/material";
import { Box } from "@mui/system";
import SaveDataButton from "../components/SaveDataButton/SaveDataButton";
import CheckboxList from "../components/CheckboxList/CheckboxList";
import { useEffect, useState } from "react";
import { fetchAllVelicineFirme } from "../api/velicina_firme.api";
import { fetchAllRadnaMesta } from "../api/radna_mesto.api";
import { fetchAllTipoviFirme } from "../api/tip_firme.api";
import { fetchAllDelatnosti } from "../api/delatnosti.api";

export default function Pretrage() {
  const [velicineFirmi, setVelicineFirmi] = useState<string[]>([]);
  const [radnaMesta, setRadnaMesta] = useState<string[]>([]);
  const [tipoviFirme, setTipoviFirme] = useState<string[]>([]);
  const [delatnosti, setDelatnosti] = useState<string[]>([]);

  const [imeFirme, setImeFirme] = useState<string>("");
  const [pib, setPib] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  const [checkedVelicineFirmi, setCheckedVelicineFirmi] = useState<string[]>([]);
  const [checkedRadnaMesta, setCheckedRadnaMesta] = useState<string[]>([]);
  const [checkedTipFirme, setCheckedTipFirme] = useState<string[]>([]);
  const [checkedDelatnost, setCheckedDelatnost] = useState<string[]>([]);

  // const gradovi = [
  //   { parent: "SVI Gradovi" },
  //   {
  //     parent: "Aleksinac",
  //     children: ["Aleksinacki rudnik", "Loćika", "Subotinac", "Trnjane"],
  //   },
  //   {
  //     parent: "Aleksandrovac",
  //     children: ["Gornji Stupanj", "Tranavci", "Sljivovo"],
  //   },
  //   {
  //     parent: "Beograd",
  //     children: [
  //       "Novi Beograd",
  //       "Zemun",
  //       "Borca",
  //       "Palilula",
  //       "Vozdovac",
  //       "Rakovica",
  //       "Zvezdara",
  //       "Savski venac",
  //       "Stari grad",
  //       "Cukarica",
  //       "Vracar",
  //     ],
  //   },
  // ];

  // merge this into one array
  // const arrayNames = ["gradovi"];
  // const arrays = [gradovi];

  // const components = arrays.map((array, index) => {
  //   return (
  //     <Grid key={arrayNames[index]} xs={12} sm={2}>
  //       <div style={{ maxHeight: "300px", overflow: "auto" }}>
  //         {array.map((item, index) => (
  //           <IndeterminateCheckbox key={arrayNames[index]} options={item} />
  //         ))}
  //       </div>
  //     </Grid>
  //   );
  // });

  useEffect(() => {
    const fetchData = async () => {
      const velicineFirme = await fetchAllVelicineFirme();
      setVelicineFirmi(velicineFirme);

      const radnaMesta = await fetchAllRadnaMesta();
      setRadnaMesta(radnaMesta);

      const tipoviFirme = await fetchAllTipoviFirme();
      setTipoviFirme(tipoviFirme);

      const delatnosti = await fetchAllDelatnosti();
      setDelatnosti(delatnosti);
    };

    fetchData();
  }, []);

  return (
    <>
      <PageTitle title={"Pretrage"} />
      {/* <Grid container spacing={2}>
        {components}
      </Grid> */}

      <CheckboxList
        data={velicineFirmi}
        subheader="Veličine Firmi"
        onCheckedChange={setCheckedVelicineFirmi}
      ></CheckboxList>
      <CheckboxList
        data={radnaMesta}
        subheader="Radna Mesta"
        onCheckedChange={setCheckedRadnaMesta}
      ></CheckboxList>
      <CheckboxList
        data={tipoviFirme}
        subheader="Tip Firme"
        onCheckedChange={setCheckedTipFirme}
      ></CheckboxList>
      <CheckboxList
        data={delatnosti}
        subheader="Delatnost"
        onCheckedChange={setCheckedDelatnost}
      ></CheckboxList>

      <Box
        component="form"
        sx={{
          "& .MuiTextField-root": { m: 1, width: "25ch" },
        }}
        noValidate
        autoComplete="off"
      >
        <Grid mt={4} maxWidth="lg">
          <TextField
            label="Ime Firme"
            value={imeFirme}
            onChange={(e) => setImeFirme(e.target.value)}
          />
          <TextField
            label="PIB / Matični broj"
            value={pib}
            onChange={(e) => setPib(e.target.value)}
          />
          <TextField label="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Grid>
      </Box>

      <SaveDataButton
        exportSubject="firma"
        fileName="pretrage_firma"
        // TODO: fix hardcoded query params
        queryParameters={{
          imeFirme: imeFirme,
          pib: pib,
          email: email,
          velicineFirmi: checkedVelicineFirmi,
          radnaMesta: checkedRadnaMesta,
          tipoviFirme: checkedTipFirme,
          delatnosti: checkedDelatnost,
        }}
      ></SaveDataButton>
      <SaveDataButton
        exportSubject="zaposleni"
        fileName="pretrage_zaposleni"
        // TODO: fix hardcoded query params
        queryParameters={{
          imeFirme: imeFirme,
          pib: pib,
          email: email,
          velicineFirmi: checkedVelicineFirmi,
          radnaMesta: checkedRadnaMesta,
          tipoviFirme: checkedTipFirme,
          delatnosti: checkedDelatnost,
        }}
      ></SaveDataButton>

      <Button variant="contained" sx={{ m: 1, mb: 4 }} size="large" color="info">
        Pretrazi
      </Button>

      {/* <MyTable></MyTable> */}
    </>
  );
}
