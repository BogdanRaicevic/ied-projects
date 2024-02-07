import { TextField, Autocomplete, Checkbox, Button } from "@mui/material";
import { Box } from "@mui/system";
import { normalizedRadnaMesta } from "../../fakeData/companyData";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { Zaposleni } from "../../schemas/companySchemas";
import { useState } from "react";

type ZaposleniFormProps = {
  zaposleni?: Zaposleni;
  onSubmit: (zaposleniData: Zaposleni) => void;
};

export function ZaposleniForm({ zaposleni = {} as Zaposleni, onSubmit }: ZaposleniFormProps) {
  const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
  const checkedIcon = <CheckBoxIcon fontSize="small" />;

  const [zaposleniFormData, setZaposleniFormData] = useState(zaposleni);
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setZaposleniFormData({
      ...zaposleniFormData,
      [event.target.id]: event.target.value,
    });
  };
  const handleRadnaMestaChange = (_event: React.SyntheticEvent, newValue: string[]) => {
    setZaposleniFormData({
      ...zaposleniFormData,
      radnaMesta: newValue,
    });
  };

  function handleDodajZaposlenog(event: React.FormEvent) {
    event.preventDefault();
    onSubmit(zaposleniFormData);
  }

  return (
    <Box paddingBottom={5} component="form" onSubmit={handleDodajZaposlenog}>
      <TextField sx={{ m: 1 }} id="ime" label="Ime" variant="outlined" value={zaposleni.ime} />
      <TextField
        sx={{ m: 1 }}
        id="prezime"
        label="Prezime"
        variant="outlined"
        value={zaposleni.prezime}
        onChange={handleChange}
      />
      <TextField
        sx={{ m: 1 }}
        id="email"
        label="Email"
        variant="outlined"
        value={zaposleni.email}
        onChange={handleChange}
      />
      <TextField
        sx={{ m: 1 }}
        id="broj-sertifikata"
        label="Broj sertifikata"
        variant="outlined"
        value={zaposleni.brojSertifikata}
        onChange={handleChange}
      />
      <TextField
        sx={{ m: 1 }}
        id="telefon"
        label="Telefon"
        variant="outlined"
        value={zaposleni.telefon}
        onChange={handleChange}
      />

      <Autocomplete
        sx={{ m: 1, width: "98%" }}
        multiple
        limitTags={2}
        id="multiple-radna-mesta"
        options={normalizedRadnaMesta}
        getOptionLabel={(option) => option}
        onChange={handleRadnaMestaChange}
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
        onChange={handleChange}
      ></TextField>
      <Button sx={{ m: 1 }} variant="contained" type="submit">
        Sacuvaj zaposlenog
      </Button>
    </Box>
  );
}
