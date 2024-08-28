import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Grid from "@mui/system/Unstable_Grid/Grid";
import { TextField } from "@mui/material";
import { useState } from "react";

interface PretrageSaveDialogProps {
  open: boolean;
  handleClose: () => void;
  handleSave: (nazivPretrage: string) => void;
}

export default function PretrageSaveDialog({
  open,
  handleClose,
  handleSave,
}: PretrageSaveDialogProps) {
  const [nazivPretrage, setNazivPretrage] = useState("");

  const handleSaveClick = () => {
    handleSave(nazivPretrage);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="pretraga-dialog-title"
      aria-describedby="pretraga-dialog-description"
    >
      <DialogTitle id="pretraga-dialog-title">
        {"Izaberite kako ćete sačuvati parametre pretrage?"}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} alignItems="center">
          <Grid xs={6}>
            <Button variant="outlined" color="warning" onClick={handleSaveClick}>
              Sačuvaj preko postojeće
            </Button>
          </Grid>

          <Grid xs={6}>
            <TextField
              sx={{ m: 2 }}
              placeholder="Naziv pretrage"
              onChange={(e) => setNazivPretrage(e.target.value)}
            ></TextField>
            <Button variant="contained" color="success" onClick={handleSaveClick}>
              Sačuvaj kao novu pretragu
            </Button>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} variant="outlined" color="error">
          Napusti
        </Button>
      </DialogActions>
    </Dialog>
  );
}
