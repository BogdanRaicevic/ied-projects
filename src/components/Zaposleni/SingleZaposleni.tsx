import {
  TextField,
  Autocomplete,
  Checkbox,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
} from "@mui/material";
import { Box } from "@mui/system";
import { normalizedRadnaMesta } from "../../fakeData/companyData";
import PrijavaOdjava from "../PrijavaOdjava";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { useState } from "react";

type Seminar_Zaposleni = {
  naziv: string;
  predavac: string;
  datum: string;
  id: string;
};

type Zaposleni = {
  ime: string;
  prezime: string;
  email: string;
  brojSertifikata?: string | undefined;
  komentari?: string | undefined;
  radnaMesta: string[];
  id: string;
  seminari?: Seminar_Zaposleni[];
  telefon: string;
  zeleMarketingMaterijal: boolean;
};

export function SingleZaposleni(zaposleni: Zaposleni) {
  const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
  const checkedIcon = <CheckBoxIcon fontSize="small" />;

  const [zap, setZap] = useState<Zaposleni>(zaposleni);

  const renderVisitedSeminari = (seminari: Seminar_Zaposleni[]) => {
    return (
      <List>
        {seminari.map((seminar, index) => (
          <ListItem key={index}>{seminar.naziv}</ListItem>
        ))}
      </List>
    );
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setZap({ ...zap, zeleMarketingMaterijal: event.target.checked });
  };

  return (
    <Box paddingBottom={5}>
      <PrijavaOdjava prijavljeniValue={zap.zeleMarketingMaterijal} prijavaChange={handleChange} />

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

      <Card>
        <CardContent>
          <Typography>Poseceni seminari:</Typography>
          {renderVisitedSeminari(zaposleni.seminari ?? [])}
        </CardContent>
      </Card>
    </Box>
  );
}
