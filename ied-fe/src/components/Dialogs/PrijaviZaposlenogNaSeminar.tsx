import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  TextField,
  DialogActions,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Autocomplete,
} from "@mui/material";
import { Grid } from "@mui/system";
import { useFetchSeminari } from "../../hooks/useFetchData";

export default function PrijavaNaSeminarDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const handleSeminarChange = () => {
    console.log("1");
  };

  const { fetchedSeminars } = useFetchSeminari();

  const ooo = fetchedSeminars?.seminari.map(item => {
    const d = {
      label: `${item.datum} ___ ${item.naziv} `,
      id: item._id
    }

    return d;
  })


  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg">
      <DialogTitle id="prijavi-na-seminar-dialog-title">{"Prijavi osobu na seminar"}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} alignItems="center">
          <Grid size={12}>
            <TextField
              sx={{ m: 2 }}
              key={"prijava-naziv-firme"}
              value={"naziv virme ovde"}
              label="Naziv Firme"
              disabled
            ></TextField>
            <TextField
              sx={{ m: 2 }}
              key={"prijava-email-firme"}
              value={"email fierme"}
              label="Email Firme"
              disabled
            ></TextField>
            <TextField
              sx={{ m: 2 }}
              key={"prijava-telefon-firme"}
              value={"ntelefon firme"}
              label="Telefon Firme"
              disabled
            ></TextField>
          </Grid>
          <Grid size={12}>
            <TextField
              sx={{ m: 2 }}
              key={"prijava-ime-zaposlenog"}
              value={"ime ovde"}
              label="Ime zaposlenog"
              disabled
            ></TextField>
            <TextField
              sx={{ m: 2 }}
              key={"prijava-prezime-zaposlenog"}
              value={"prezime ovde"}
              label="Prezime zaposlenog"
              disabled
            ></TextField>
            <TextField
              sx={{ m: 2 }}
              key={"prijava-telefon-zaposlenog"}
              value={"telefon ovde"}
              label="Telefon zaposlenog"
              disabled
            ></TextField>
            <TextField
              sx={{ m: 2 }}
              key={"prijava-email-zaposlenog"}
              value={"email ovde"}
              label="Email zaposlenog"
              disabled
            ></TextField>
          </Grid>

          <Grid size={12}>
            <FormControl sx={{ m: 2 }}>
              <FormLabel id="demo-radio-buttons-group-label">Prisustvo</FormLabel>
              <RadioGroup
                aria-labelledby="demo-radio-buttons-group-label"
                defaultValue="online"
                name="radio-buttons-group"
              >
                <FormControlLabel value="online" control={<Radio />} label="Online" />
                <FormControlLabel value="offline" control={<Radio />} label="Offline" />
                <FormControlLabel value="ne znam" control={<Radio />} label="Ne znam" />
              </RadioGroup>
            </FormControl>
            <Autocomplete
              disablePortal
              options={ooo || []}
              renderInput={(params) => <TextField {...params} label="Seminar" />}
            >

            </Autocomplete>

          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" color="success">
          {" "}
          Sačuvaj prijavu
        </Button>
        <Button onClick={onClose} variant="outlined" color="error">
          Napusti
        </Button>
      </DialogActions>
    </Dialog>
  );
}
