import MyTable from "../components/MyTable";
import PageTitle from "../components/PageTitle";
import Grid from "@mui/material/Unstable_Grid2";
import { Button, TextField } from "@mui/material";
import { Box } from "@mui/system";
import SaveDataButton from "../components/SaveDataButton/SaveDataButton";
import CheckboxList from "../components/CheckboxList/CheckboxList";
import AutocompleteCheckbox from "../components/AutocompleteCheckbox";
import { useEffect, useState } from "react";
import { fetchAllVelicineFirme } from "../api/velicina_firme.api";
import { fetchAllRadnaMesta } from "../api/radna_mesto.api";
import { fetchAllTipoviFirme } from "../api/tip_firme.api";
import { fetchAllDelatnosti } from "../api/delatnosti.api";
import { fetchAllMesta } from "../api/mesta.api";
import NegationCheckbox from "../components/NegationCheckbox";

export default function Pretrage() {
  const [velicineFirmi, setVelicineFirmi] = useState<string[]>([]);
  const [radnaMesta, setRadnaMesta] = useState<string[]>([]);
  const [tipoviFirme, setTipoviFirme] = useState<string[]>([]);
  const [delatnosti, setDelatnosti] = useState<string[]>([]);
  const [mesta, setMesta] = useState<string[]>([]);

  const [imeFirme, setImeFirme] = useState<string>("");
  const [pib, setPib] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  const [checkedVelicineFirmi, setCheckedVelicineFirmi] = useState<string[]>([]);
  const [checkedRadnaMesta, setCheckedRadnaMesta] = useState<string[]>([]);
  const [checkedTipFirme, setCheckedTipFirme] = useState<string[]>([]);
  const [checkedDelatnost, setCheckedDelatnost] = useState<string[]>([]);
  const [checkedMesta, setCheckedMesta] = useState<string[]>([]);

  const [checkedNegations, setCheckedNegations] = useState<string[]>([]); // Array to hold values of checked checkboxes
  const handleNegationChange = (value: string) => {
    setCheckedNegations(
      (prevValues) =>
        prevValues.includes(value)
          ? prevValues.filter((v) => v !== value) // Remove if already checked
          : [...prevValues, value] // Add if not checked
    );
  };

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

      const mesta = await fetchAllMesta();
      setMesta(mesta);
    };

    fetchData();
  }, []);

  const [pretraziQueryParameters, setPretraziQueryParameters] = useState<{
    imeFirme: string;
    pib: string;
    email: string;
    velicineFirmi: string[];
    radnaMesta: string[];
    tipoviFirme: string[];
    delatnosti: string[];
    mesta: string[];
    negacije: string[];
  }>({
    imeFirme: "",
    pib: "",
    email: "",
    velicineFirmi: [],
    radnaMesta: [],
    tipoviFirme: [],
    delatnosti: [],
    mesta: [],
    negacije: [],
  });

  const handlePretraziClick = () => {
    setPretraziQueryParameters({
      imeFirme,
      pib,
      email,
      velicineFirmi: checkedVelicineFirmi,
      radnaMesta: checkedRadnaMesta,
      tipoviFirme: checkedTipFirme,
      delatnosti: checkedDelatnost,
      mesta: checkedMesta,
      negacije: checkedNegations,
    });
  };

  const queryParameters = {
    imeFirme: imeFirme,
    pib: pib,
    email: email,
    velicineFirmi: checkedVelicineFirmi,
    radnaMesta: checkedRadnaMesta,
    tipoviFirme: checkedTipFirme,
    delatnosti: checkedDelatnost,
    mesta: checkedMesta,
    negacije: checkedNegations,
  };

  return (
    <>
      <PageTitle title={"Pretrage"} />

      <Grid container spacing={2}>
        <Grid xs={9}>
          <Grid container direction="column">
            <Grid container alignItems="center">
              <Grid xs={10} sx={{ width: "75%" }}>
                <AutocompleteCheckbox
                  data={radnaMesta}
                  onCheckedChange={setCheckedRadnaMesta}
                  placeholder="Radno Mesto"
                  id="radno-mesto"
                  key="autocomplete-radno-mesto"
                ></AutocompleteCheckbox>
              </Grid>
              <Grid px={2} xs={2}>
                <NegationCheckbox
                  key="negate-radno-mesto"
                  value="negate-radno-mesto"
                  negationChecked={checkedNegations.includes("negate-radno-mesto")}
                  onNegationChange={handleNegationChange}
                ></NegationCheckbox>
              </Grid>
            </Grid>
            <Grid container alignItems="center">
              <Grid xs={10} sx={{ width: "75%" }}>
                <AutocompleteCheckbox
                  data={tipoviFirme}
                  onCheckedChange={setCheckedTipFirme}
                  placeholder="Tip Firme"
                  id="tip-firme"
                  key="autocomplete-tip-firme"
                ></AutocompleteCheckbox>
              </Grid>
              <Grid px={2} xs={2}>
                <NegationCheckbox
                  key="negate-tip-firme"
                  value="negate-tip-firme"
                  negationChecked={checkedNegations.includes("negate-tip-firme")}
                  onNegationChange={handleNegationChange}
                ></NegationCheckbox>
              </Grid>
            </Grid>
            <Grid container alignItems="center">
              <Grid xs={10} sx={{ width: "75%" }}>
                <AutocompleteCheckbox
                  data={delatnosti}
                  onCheckedChange={setCheckedDelatnost}
                  placeholder="Delatnost"
                  id="delatnost"
                  key="autocomplete-delatnost"
                ></AutocompleteCheckbox>
              </Grid>
              <Grid px={2} xs={2}>
                <NegationCheckbox
                  key="negate-delatnost"
                  value="negate-delatnost"
                  negationChecked={checkedNegations.includes("negate-delatnost")}
                  onNegationChange={handleNegationChange}
                ></NegationCheckbox>
              </Grid>
            </Grid>
            <Grid container alignItems="center">
              <Grid xs={10} sx={{ width: "75%" }}>
                <AutocompleteCheckbox
                  data={mesta}
                  onCheckedChange={setCheckedMesta}
                  placeholder="Mesta"
                  id="mesto"
                  key="autocomplete-mesto"
                ></AutocompleteCheckbox>
              </Grid>

              <Grid px={2} xs={2}>
                <NegationCheckbox
                  key="negate-mesto"
                  value="negate-mesto"
                  negationChecked={checkedNegations.includes("negate-mesto")}
                  onNegationChange={handleNegationChange}
                ></NegationCheckbox>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Grid xs={3}>
          <CheckboxList
            data={velicineFirmi}
            subheader="Veličine Firmi"
            onCheckedChange={setCheckedVelicineFirmi}
          ></CheckboxList>
        </Grid>
      </Grid>

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
        queryParameters={queryParameters}
      ></SaveDataButton>
      <SaveDataButton
        exportSubject="zaposleni"
        fileName="pretrage_zaposleni"
        queryParameters={queryParameters}
      ></SaveDataButton>

      <Button
        variant="contained"
        sx={{ m: 1, mb: 4 }}
        size="large"
        color="info"
        onClick={handlePretraziClick}
      >
        Pretrazi
      </Button>

      <MyTable {...pretraziQueryParameters} />
    </>
  );
}
