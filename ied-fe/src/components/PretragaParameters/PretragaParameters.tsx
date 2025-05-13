import { Chip, TextField } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { Box } from "@mui/system";
import AutocompleteMultiple from "../Autocomplete/Multiple";
import CheckboxList from "../CheckboxList";
import NegationCheckbox from "../NegationCheckbox";
import { usePretragaStore } from "../../store/pretragaParameters.store";
import { useFetchData } from "../../hooks/useFetchData";
import { FirmaQueryParams } from "@ied-shared/types/firmaQueryParams";
import { format } from "date-fns";
import { useEffect } from "react";

export default function PretragaParameters({ onSearchSubmit }: { onSearchSubmit: () => void }) {
  const { delatnosti, mesta, radnaMesta, tipoviFirme, velicineFirme, stanjaFirme, sviSeminari } =
    useFetchData();

  const { pretragaParameters, setPretragaParameters, toggleNegation } = usePretragaStore();

  const handleNegationChange = (value: string) => {
    toggleNegation(value);
  };

  const handleInputChange = (field: keyof FirmaQueryParams, value: any) => {
    setPretragaParameters({ [field]: value });
  };

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        // Prevent default form submission if this component is part of a <form>
        // event.preventDefault();
        onSearchSubmit(); // Call the passed-in function
      }
    };

    document.addEventListener("keydown", handleKeyPress);

    // Remove event listener when the component unmounts
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [onSearchSubmit]); // Add onSearchSubmit to dependency array

  return (
    <>
      <Grid container spacing={2} marginTop={2}>
        <Grid size={8}>
          <Grid container direction="column" gap={2}>
            <Grid container alignItems="center">
              <Grid size={10} sx={{ width: "75%" }}>
                <AutocompleteMultiple
                  data={radnaMesta}
                  onCheckedChange={(value) => handleInputChange("radnaMesta", value)}
                  placeholder="Radno Mesto"
                  id="radno-mesto"
                  key="autocomplete-radno-mesto"
                  checkedValues={pretragaParameters.radnaMesta || []}
                />
              </Grid>
              <Grid px={2} size={2}>
                <NegationCheckbox
                  key="negate-radno-mesto"
                  value="negate-radno-mesto"
                  negationChecked={
                    pretragaParameters.negacije?.includes("negate-radno-mesto") || false
                  }
                  onNegationChange={handleNegationChange}
                />
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
                  checkedValues={pretragaParameters.tipoviFirme || []}
                />
              </Grid>
              <Grid px={2} size={2}>
                <NegationCheckbox
                  key="negate-tip-firme"
                  value="negate-tip-firme"
                  negationChecked={
                    pretragaParameters.negacije?.includes("negate-tip-firme") || false
                  }
                  onNegationChange={handleNegationChange}
                />
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
                  checkedValues={pretragaParameters.delatnosti || []}
                />
              </Grid>
              <Grid px={2} size={2}>
                <NegationCheckbox
                  key="negate-delatnost"
                  value="negate-delatnost"
                  negationChecked={
                    pretragaParameters.negacije?.includes("negate-delatnost") || false
                  }
                  onNegationChange={handleNegationChange}
                />
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
                  checkedValues={pretragaParameters.mesta || []}
                />
              </Grid>

              <Grid px={2} size={2}>
                <NegationCheckbox
                  key="negate-mesto"
                  value="negate-mesto"
                  negationChecked={pretragaParameters.negacije?.includes("negate-mesto") || false}
                  onNegationChange={handleNegationChange}
                />
              </Grid>
            </Grid>
            <Grid container alignItems="center">
              <Grid size={10} sx={{ width: "75%" }}>
                <AutocompleteMultiple
                  data={sviSeminari}
                  onCheckedChange={(value) => handleInputChange("seminari", value)}
                  placeholder="Seminari"
                  id="seminar"
                  key="autocomplete-seminar"
                  checkedValues={pretragaParameters.seminari || []}
                  getOptionLabel={(option) => {
                    return `${format(option.datum, "dd.MM.yyyy")} - ${option.naziv}`;
                  }}
                  renderTag={(getTagProps, index, option) => {
                    const { key, ...tagProps } = getTagProps({ index });
                    return (
                      <Chip
                        variant="outlined"
                        label={`${format(option.datum, "dd.MM.yyyy")} - ${option.naziv}`}
                        key={key}
                        {...tagProps}
                      />
                    );
                  }}
                />
              </Grid>

              <Grid px={2} size={2}>
                <NegationCheckbox
                  key="negate-seminar"
                  value="negate-seminar"
                  negationChecked={pretragaParameters.negacije?.includes("negate-seminar") || false}
                  onNegationChange={handleNegationChange}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Grid size={2}>
          <CheckboxList
            data={velicineFirme}
            subheader="Veličine Firmi"
            onCheckedChange={(value) => handleInputChange("velicineFirmi", value)}
            checkedValues={pretragaParameters.velicineFirmi || []}
          />
        </Grid>
        <Grid size={2}>
          <CheckboxList
            data={stanjaFirme}
            subheader="Stanja Firmi"
            onCheckedChange={(value) => handleInputChange("stanjaFirme", value)}
            checkedValues={pretragaParameters.stanjaFirme || []}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2} marginTop={2}>
        <Grid size={8}>
          <Grid container alignItems="center"></Grid>
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
            label="PIB"
            value={pretragaParameters.pib}
            onChange={(e) => handleInputChange("pib", e.target.value)}
          />
          <TextField
            label="Matični broj"
            value={pretragaParameters.maticniBroj}
            onChange={(e) => handleInputChange("maticniBroj", e.target.value)}
          />
          <TextField
            label="E-mail"
            value={pretragaParameters.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
          />
          <TextField
            label="JBKJS"
            value={pretragaParameters.jbkjs}
            onChange={(e) => handleInputChange("jbkjs", e.target.value)}
          />
          <TextField
            label="Komentar"
            value={pretragaParameters.komentar}
            onChange={(e) => handleInputChange("komentar", e.target.value)}
          />
          <TextField
            label="Ime i prezime zaposlenog"
            value={pretragaParameters.imePrezime}
            onChange={(e) => handleInputChange("imePrezime", e.target.value)}
          />
          <TextField
            label="E-mail zaposlenog"
            value={pretragaParameters.emailZaposlenog}
            onChange={(e) => handleInputChange("emailZaposlenog", e.target.value)}
          />
        </Grid>
      </Box>
    </>
  );
}
