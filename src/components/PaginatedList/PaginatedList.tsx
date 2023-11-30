import { SetStateAction, useState } from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Pagination from "@mui/material/Pagination";
import {
  Card,
  CardContent,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
} from "@mui/material";

const itemsPerPage = 5;
const items = [
  "Item 1",
  "Item 2",
  "Item 3",
  "Item 4",
  "Item 5",
  "Item 6",
  "Item 7",
  "Item 8",
  "Item 9",
  "Item 10",
]; // Replace with your items

function PaginatedList() {
  const [page, setPage] = useState(1);

  const handleChange = (_event: any, value: SetStateAction<number>) => {
    setPage(value);
  };

  return (
    <div>
      <List>
        {items.slice((page - 1) * itemsPerPage, page * itemsPerPage).map((item, index) => (
          // <ListItem key={index}>{item}</ListItem>
          <Card key={index} sx={{ mb: 1 }}>
            <CardContent sx={{ backgroundColor: "#ead5d3" }}>
              <Typography variant="h6" component="div">
                {"TEST comapny name: " + item} {/* Replace with your company name variable */}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {"TEST PIB: " + item} {/* Replace with your company id variable */}
              </Typography>
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  <Typography>Ime i prezime zaposlenog: {item}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <TextField sx={{ m: 1 }} id="ime" label="Ime" variant="outlined" />
                  <TextField sx={{ m: 1 }} id="prezime" label="Prezime" variant="outlined" />
                  <TextField sx={{ m: 1 }} id="email" label="Email" variant="outlined" />
                  <TextField
                    sx={{ m: 1 }}
                    id="broj-sertifikata"
                    label="Broj sertifikata"
                    variant="outlined"
                  />
                  <TextField
                    sx={{ m: 1, width: "100%" }}
                    id="outlined-multiline-static"
                    label="Komentari"
                    multiline
                    rows={4}
                  ></TextField>

                  <Card>
                    <CardContent>
                      <Typography>Poseceni seminari</Typography>
                      <List>
                        <ListItem>Sminar 1</ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </AccordionDetails>
              </Accordion>
            </CardContent>
          </Card>
        ))}
      </List>
      <Pagination
        sx={{ mb: 5 }}
        count={Math.ceil(items.length / itemsPerPage)}
        page={page}
        onChange={handleChange}
      />
    </div>
  );
}

export default PaginatedList;
