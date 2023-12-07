import { SetStateAction, useState } from "react";
import List from "@mui/material/List";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Pagination from "@mui/material/Pagination";
import {
  Card,
  CardContent,
  Typography,
  Accordion,
  AccordionDetails,
  TextField,
  Box,
  ListItem,
  AccordionSummary,
  Autocomplete,
  Checkbox,
} from "@mui/material";
import { fakeZaposleni } from "../../fakeData/zaposleniPretraga";
import PrijavaOdjava from "../PrijavaOdjava";
import { normalizedRadnaMesta } from "../../fakeData/companyData";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";

const itemsPerPage = 5;
const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

function PaginatedList() {
  const [page, setPage] = useState(1);

  const handleChange = (_event: any, value: SetStateAction<number>) => {
    setPage(value);
  };

  type Zaposleni = {
    ime: string;
    prezime: string;
    email: string;
    brojSertifikata?: string;
    komentari?: string;
    radnaMesta: string[];
    id: string;
    seminari?: Seminar_Zaposleni[];
    telefon: string;
  };

  type Seminar_Zaposleni = {
    naziv: string;
    predavac: string;
    datum: string;
    id: string;
  };

  const renderVisitedSeminari = (seminari: Seminar_Zaposleni[]) => {
    return seminari.map((s) => (
      <List>
        <ListItem>{s.naziv}</ListItem>
      </List>
    ));
  };
  const renderZaposleni = (zaposleni: Zaposleni[]) => {
    return zaposleni.map((z, index: number) => (
      <Box key={index} paddingBottom={5}>
        <PrijavaOdjava />

        <TextField sx={{ m: 1 }} id="ime" label="Ime" variant="outlined" value={z.ime} />
        <TextField
          sx={{ m: 1 }}
          id="prezime"
          label="Prezime"
          variant="outlined"
          value={z.prezime}
        />
        <TextField sx={{ m: 1 }} id="email" label="Email" variant="outlined" value={z.email} />
        <TextField
          sx={{ m: 1 }}
          id="broj-sertifikata"
          label="Broj sertifikata"
          variant="outlined"
          value={z.brojSertifikata}
        />
        <TextField
          sx={{ m: 1 }}
          id="telefon"
          label="Telefon"
          variant="outlined"
          value={z.telefon}
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
          value={z.komentari}
        ></TextField>

        <Card>
          <CardContent>
            <Typography>Poseceni seminari:</Typography>
            {renderVisitedSeminari(z.seminari || [])}
          </CardContent>
        </Card>
      </Box>
    ));
  };

  return (
    <div>
      <List>
        {fakeZaposleni.slice((page - 1) * itemsPerPage, page * itemsPerPage).map((item, index) => (
          <Card key={index} sx={{ mb: 1 }}>
            <CardContent sx={{ backgroundColor: "#ead5d3" }}>
              <Typography variant="h6" component="div">
                {item.firma.naziv} {/* Replace with your company name variable */}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {"PIB: " + item.firma.pib} {/* Replace with your company id variable */}
              </Typography>
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  <Typography>Broj zaposlenih: {item.firma.zaposleni.length}</Typography>
                </AccordionSummary>
                <AccordionDetails>{renderZaposleni(item.firma.zaposleni)}</AccordionDetails>
              </Accordion>
            </CardContent>
          </Card>
        ))}
      </List>
      <Pagination
        sx={{ mb: 5 }}
        count={Math.ceil(fakeZaposleni.length / itemsPerPage)}
        page={page}
        onChange={handleChange}
      />
    </div>
  );
}

export default PaginatedList;
