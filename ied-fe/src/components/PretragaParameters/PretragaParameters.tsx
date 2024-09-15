import { TextField } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { Box } from "@mui/system";
import AutocompleteMultiple from "../Autocomplete/Multiple";
import CheckboxList from "../CheckboxList";
import NegationCheckbox from "../NegationCheckbox";
import { useEffect, useState } from "react";

import { usePretragaStore } from "../../store/pretragaParameters.store";
import { useFetchData } from "../../hooks/useFetchData";

export type PretragaParametersType = {
  imeFirme: string;
  pib: string;
  email: string;
  velicineFirmi: string[];
  radnaMesta: string[];
  tipoviFirme: string[];
  delatnosti: string[];
  mesta: string[];
  negacije: string[];
};

export default function PretragaParameters() {
  const [velicineFirmi, setVelicineFirmi] = useState<string[]>([]);
  const [radnaMesta, setRadnaMesta] = useState<string[]>([]);
  const [tipoviFirme, setTipoviFirme] = useState<string[]>([]);
  const [delatnosti, setDelatnosti] = useState<string[]>([]);
  const [mesta, setMesta] = useState<string[]>([]);

  const {
    delatnosti: fetchedDelatnosti,
    mesta: fetchedMesta,
    radnaMesta: fetchedRadnaMesta,
    tipoviFirme: fetchedTipoviFirme,
    velicineFirme: fetchedVelicineFirme,
  } = useFetchData();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setVelicineFirmi(fetchedVelicineFirme || []);
        setRadnaMesta(fetchedRadnaMesta || []);
        setTipoviFirme(fetchedTipoviFirme || []);
        setDelatnosti(fetchedDelatnosti || []);
        setMesta(fetchedMesta || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [
    fetchedDelatnosti,
    fetchedMesta,
    fetchedRadnaMesta,
    fetchedTipoviFirme,
    fetchedVelicineFirme,
  ]);

  const { pretragaParameters, setPretragaParameters, toggleNegation } = usePretragaStore();

  const handleNegationChange = (value: string) => {
    toggleNegation(value);
  };

  const handleInputChange = (field: keyof PretragaParametersType, value: any) => {
    setPretragaParameters({ [field]: value });
  };

  return (
    <>
      <Grid container spacing={2}>
        <Grid size={9}>
          <Grid container direction="column">
            <Grid container alignItems="center">
              <Grid size={10} sx={{ width: "75%" }}>
                <AutocompleteMultiple
                  data={radnaMesta}
                  onCheckedChange={(value) => handleInputChange("radnaMesta", value)}
                  placeholder="Radno Mesto"
                  id="radno-mesto"
                  key="autocomplete-radno-mesto"
                  checkedValues={pretragaParameters.radnaMesta}
                ></AutocompleteMultiple>
              </Grid>
              <Grid px={2} size={2}>
                <NegationCheckbox
                  key="negate-radno-mesto"
                  value="negate-radno-mesto"
                  negationChecked={pretragaParameters.negacije.includes("negate-radno-mesto")}
                  onNegationChange={handleNegationChange}
                ></NegationCheckbox>
              </Grid>
            </Grid>
            <Grid container alignItems="center">
              <Grid size={10} sx={{ width: "75%" }}>
                <AutocompleteMultiple
                  data={tipoviFirme}
                  onCheckedChange={(value) => handleInputChange("tipoviFirme", value)}
                  placeholder="Tip Firme"
                  id="tip-firme"
                  key="autocomplete-tip-firme"
                  checkedValues={pretragaParameters.tipoviFirme}
                ></AutocompleteMultiple>
              </Grid>
              <Grid px={2} size={2}>
                <NegationCheckbox
                  key="negate-tip-firme"
                  value="negate-tip-firme"
                  negationChecked={pretragaParameters.negacije.includes("negate-tip-firme")}
                  onNegationChange={handleNegationChange}
                ></NegationCheckbox>
              </Grid>
            </Grid>
            <Grid container alignItems="center">
              <Grid size={10} sx={{ width: "75%" }}>
                <AutocompleteMultiple
                  data={delatnosti}
                  onCheckedChange={(value) => handleInputChange("delatnosti", value)}
                  placeholder="Delatnost"
                  id="delatnost"
                  key="autocomplete-delatnost"
                  checkedValues={pretragaParameters.delatnosti}
                ></AutocompleteMultiple>
              </Grid>
              <Grid px={2} size={2}>
                <NegationCheckbox
                  key="negate-delatnost"
                  value="negate-delatnost"
                  negationChecked={pretragaParameters.negacije.includes("negate-delatnost")}
                  onNegationChange={handleNegationChange}
                ></NegationCheckbox>
              </Grid>
            </Grid>
            <Grid container alignItems="center">
              <Grid size={10} sx={{ width: "75%" }}>
                <AutocompleteMultiple
                  data={mesta}
                  onCheckedChange={(value) => handleInputChange("mesta", value)}
                  placeholder="Mesta"
                  id="mesto"
                  key="autocomplete-mesto"
                  checkedValues={pretragaParameters.mesta}
                ></AutocompleteMultiple>
              </Grid>

              <Grid px={2} size={2}>
                <NegationCheckbox
                  key="negate-mesto"
                  value="negate-mesto"
                  negationChecked={pretragaParameters.negacije.includes("negate-mesto")}
                  onNegationChange={handleNegationChange}
                ></NegationCheckbox>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Grid size={3}>
          <CheckboxList
            data={velicineFirmi}
            subheader="Veličine Firmi"
            onCheckedChange={(value) => handleInputChange("velicineFirmi", value)}
            checkedValues={pretragaParameters.velicineFirmi}
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
            value={pretragaParameters.imeFirme}
            onChange={(e) => handleInputChange("imeFirme", e.target.value)}
          />
          <TextField
            label="PIB / Matični broj"
            value={pretragaParameters.pib}
            onChange={(e) => handleInputChange("pib", e.target.value)}
          />
          <TextField
            label="E-mail"
            value={pretragaParameters.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
          />
        </Grid>
      </Box>
    </>
  );
}
