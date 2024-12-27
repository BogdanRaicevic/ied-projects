import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Grid from "@mui/material/Grid2";
import { TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { TODO_ANY } from "../../../../ied-be/src/utils/utils";

interface PretrageSaveDialogProps {
  open: boolean;
  handleClose: () => void;
  handleSave: (nazivPretrage: string, isNew: boolean) => void;
  selectedPretraga: { id: string; naziv: string };
}

export default function PretrageSaveDialog({
  open,
  handleClose,
  handleSave,
  selectedPretraga,
}: PretrageSaveDialogProps) {
  const [nazivPretrage, setNazivPretrage] = useState("");

  useEffect(() => {
    if (!open) {
      setNazivPretrage("");
    }
  }, [open]);

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
          <Grid size={6}>
            <Button
              variant="outlined"
              color="warning"
              onClick={() => {
                handleSave(selectedPretraga.naziv, false);
              }}
              disabled={!selectedPretraga.naziv}
            >
              Sačuvaj preko postojeće
            </Button>
          </Grid>

          <Grid size={6}>
            <TextField
              sx={{ m: 2 }}
              placeholder="Naziv pretrage"
              onChange={(e: TODO_ANY) => setNazivPretrage(e.target.value)}
            ></TextField>
            <Button
              variant="contained"
              color="success"
              onClick={() => {
                handleSave(nazivPretrage, true);
              }}
              disabled={!nazivPretrage}
            >
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
