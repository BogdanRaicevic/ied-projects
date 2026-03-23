import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import { format } from "date-fns";
import type { ZaposleniType } from "ied-shared";
import { useEffect, useState } from "react";

type KontaktKomentarDialogProps = {
  open: boolean;
  onClose: () => void;
  zaposleniList: ZaposleniType[];
  onConfirm: (text: string, selectedZaposleni: ZaposleniType | null) => void;
};

export default function KontaktKomentarDialog({
  open,
  onClose,
  zaposleniList,
  onConfirm,
}: KontaktKomentarDialogProps) {
  const [customText, setCustomText] = useState("");
  const [selectedZaposleni, setSelectedZaposleni] =
    useState<ZaposleniType | null>(null);

  const todayFormatted = format(new Date(), "dd.MM.yyyy");

  useEffect(() => {
    if (open) {
      setCustomText("");
      setSelectedZaposleni(null);
    }
  }, [open]);

  const handleConfirm = () => {
    onConfirm(customText, selectedZaposleni);
  };

  const getZaposleniLabel = (z: ZaposleniType) =>
    `${z.ime || ""} ${z.prezime || ""}`.trim() || z.e_mail || "—";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Dodaj komentar kontakta</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>
              Datum:
            </Typography>
            <Typography variant="body2" fontWeight={500}>
              {todayFormatted}
            </Typography>
          </Box>

          <TextField
            label="Komentar"
            multiline
            rows={3}
            fullWidth
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="Unesite komentar..."
            autoFocus
          />

          <Typography variant="caption" color="text.secondary">
            Komentar koji će biti dodat firmi: <strong>{todayFormatted} - {customText || "..."}</strong>
          </Typography>

          <Autocomplete
            options={zaposleniList}
            getOptionLabel={getZaposleniLabel}
            isOptionEqualToValue={(option, value) => option._id === value._id}
            value={selectedZaposleni}
            onChange={(_, newValue) => setSelectedZaposleni(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Dodaj isti komentar zaposlenom (opciono)"
              />
            )}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined" color="error">
          Odustani
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="success"
          disabled={!customText.trim()}
        >
          Potvrdi
        </Button>
      </DialogActions>
    </Dialog>
  );
}
