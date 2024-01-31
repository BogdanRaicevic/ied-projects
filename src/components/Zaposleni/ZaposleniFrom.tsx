import { TextField, Autocomplete, Checkbox } from "@mui/material";
import { Box } from "@mui/system";
import { normalizedRadnaMesta } from "../../fakeData/companyData";
import PrijavaOdjava from "../PrijavaOdjava";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { useState } from "react";
import { Zaposleni } from "../../schemas/companySchemas";

export function ZaposleniForm({ zaposleni }: { zaposleni: Zaposleni }) {
  const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
  const checkedIcon = <CheckBoxIcon fontSize="small" />;

  const [zaposleniPrijava, setZaposleniPrijava] = useState<Zaposleni>(zaposleni || {});

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setZaposleniPrijava({ ...zaposleniPrijava, zeleMarketingMaterijal: event.target.checked });
  };

  return (
    <Box paddingBottom={5}>
      <PrijavaOdjava
        prijavljeniValue={zaposleniPrijava.zeleMarketingMaterijal}
        prijavaChange={handleChange}
      />

      <TextField sx={{ m: 1 }} id="ime" label="Ime" variant="outlined" value={zaposleni.ime} />
      <TextField
        sx={{ m: 1 }}
        id="prezime"
        label="Prezime"
        variant="outlined"
        value={zaposleni.prezime}
      />
      <TextField
        sx={{ m: 1 }}
        id="email"
        label="Email"
        variant="outlined"
        value={zaposleni.email}
      />
      <TextField
        sx={{ m: 1 }}
        id="broj-sertifikata"
        label="Broj sertifikata"
        variant="outlined"
        value={zaposleni.brojSertifikata}
      />
      <TextField
        sx={{ m: 1 }}
        id="telefon"
        label="Telefon"
        variant="outlined"
        value={zaposleni.telefon}
      />

      <Autocomplete
        sx={{ m: 1, width: "98%" }}
        multiple
        limitTags={2}
        id="multiple-radna-mesta"
        options={normalizedRadnaMesta}
        getOptionLabel={(option) => option}
        renderOption={(props, option, { selected }) => (
          <li {...props}>
            <Checkbox
              icon={icon}
              checkedIcon={checkedIcon}
              style={{ marginRight: 8 }}
              checked={selected}
            />
            {option}
          </li>
        )}
        renderInput={(params) => (
          <TextField {...params} label="Radna mesta" placeholder="Radna mesta" />
        )}
      />
      <TextField
        sx={{ m: 1, width: "98%" }}
        id="outlined-multiline-static"
        label="Komentari"
        multiline
        rows={4}
        value={zaposleni.komentari}
      ></TextField>
    </Box>
  );
}
