import { TextField } from "@mui/material";
import Grid from "@mui/system/Unstable_Grid";
import { Box } from "@mui/system";
import AutocompleteCheckbox from "../AutocompleteCheckbox";
import CheckboxList from "../CheckboxList";
import NegationCheckbox from "../NegationCheckbox";
import { useEffect, useState } from "react";
import { fetchAllDelatnosti } from "../../api/delatnosti.api";
import { fetchAllMesta } from "../../api/mesta.api";
import { fetchAllRadnaMesta } from "../../api/radna_mesto.api";
import { fetchAllTipoviFirme } from "../../api/tip_firme.api";
import { fetchAllVelicineFirme } from "../../api/velicina_firme.api";

import { usePretragaStore } from "../../store/pretragaParameters.store";

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
        <Grid xs={9}>
          <Grid container direction="column">
            <Grid container alignItems="center">
              <Grid xs={10} sx={{ width: "75%" }}>
                <AutocompleteCheckbox
                  data={radnaMesta}
                  onCheckedChange={(value) => handleInputChange("radnaMesta", value)}
                  placeholder="Radno Mesto"
                  id="radno-mesto"
                  key="autocomplete-radno-mesto"
                  checkedValues={pretragaParameters.radnaMesta}
                ></AutocompleteCheckbox>
              </Grid>
              <Grid px={2} xs={2}>
                <NegationCheckbox
                  key="negate-radno-mesto"
                  value="negate-radno-mesto"
                  negationChecked={pretragaParameters.negacije.includes("negate-radno-mesto")}
                  onNegationChange={handleNegationChange}
                ></NegationCheckbox>
              </Grid>
            </Grid>
            <Grid container alignItems="center">
              <Grid xs={10} sx={{ width: "75%" }}>
                <AutocompleteCheckbox
                  data={tipoviFirme}
                  onCheckedChange={(value) => handleInputChange("tipoviFirme", value)}
                  placeholder="Tip Firme"
                  id="tip-firme"
                  key="autocomplete-tip-firme"
                  checkedValues={pretragaParameters.tipoviFirme}
                ></AutocompleteCheckbox>
              </Grid>
              <Grid px={2} xs={2}>
                <NegationCheckbox
                  key="negate-tip-firme"
                  value="negate-tip-firme"
                  negationChecked={pretragaParameters.negacije.includes("negate-tip-firme")}
                  onNegationChange={handleNegationChange}
                ></NegationCheckbox>
              </Grid>
            </Grid>
            <Grid container alignItems="center">
              <Grid xs={10} sx={{ width: "75%" }}>
                <AutocompleteCheckbox
                  data={delatnosti}
                  onCheckedChange={(value) => handleInputChange("delatnosti", value)}
                  placeholder="Delatnost"
                  id="delatnost"
                  key="autocomplete-delatnost"
                  checkedValues={pretragaParameters.delatnosti}
                ></AutocompleteCheckbox>
              </Grid>
              <Grid px={2} xs={2}>
                <NegationCheckbox
                  key="negate-delatnost"
                  value="negate-delatnost"
                  negationChecked={pretragaParameters.negacije.includes("negate-delatnost")}
                  onNegationChange={handleNegationChange}
                ></NegationCheckbox>
              </Grid>
            </Grid>
            <Grid container alignItems="center">
              <Grid xs={10} sx={{ width: "75%" }}>
                <AutocompleteCheckbox
                  data={mesta}
                  onCheckedChange={(value) => handleInputChange("mesta", value)}
                  placeholder="Mesta"
                  id="mesto"
                  key="autocomplete-mesto"
                  checkedValues={pretragaParameters.mesta}
                ></AutocompleteCheckbox>
              </Grid>

              <Grid px={2} xs={2}>
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
        <Grid xs={3}>
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
