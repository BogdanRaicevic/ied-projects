import {
  Alert,
  type AlertColor,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

type CertificateNumberDialogProps = {
  open: boolean;
  title: string;
  inputLabel: string;
  description?: string;
  alertMessages?: string[];
  alertSeverity?: AlertColor;
  confirmLabel?: string;
  disableConfirm?: boolean;
  isSubmitting?: boolean;
  onClose: () => void;
  onConfirm: (certificateNumber: number) => Promise<void> | void;
};

export default function CertificateNumberDialog({
  open,
  title,
  inputLabel,
  description,
  alertMessages = [],
  alertSeverity = "warning",
  confirmLabel = "Generiši",
  disableConfirm = false,
  isSubmitting = false,
  onClose,
  onConfirm,
}: CertificateNumberDialogProps) {
  const [certificateNumber, setCertificateNumber] = useState("");
  const [inputError, setInputError] = useState("");

  useEffect(() => {
    if (open) {
      setCertificateNumber("");
      setInputError("");
    }
  }, [open]);

  const handleConfirm = async () => {
    const parsedValue = Number.parseInt(certificateNumber.trim(), 10);

    if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
      setInputError("Broj sertifikata mora biti pozitivan ceo broj.");
      return;
    }

    setInputError("");
    await onConfirm(parsedValue);
  };

  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          {description ? (
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          ) : null}

          {alertMessages.length > 0 ? (
            <Alert severity={alertSeverity}>
              <Box component="ul" sx={{ m: 0, pl: 2 }}>
                {alertMessages.map((message) => (
                  <Typography key={message} component="li" variant="body2">
                    {message}
                  </Typography>
                ))}
              </Box>
            </Alert>
          ) : null}

          <TextField
            autoFocus
            fullWidth
            type="number"
            label={inputLabel}
            value={certificateNumber}
            onChange={(event) => setCertificateNumber(event.target.value)}
            error={Boolean(inputError)}
            helperText={inputError}
            inputProps={{ min: 1, step: 1 }}
            disabled={isSubmitting}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          variant="outlined"
          color="error"
          disabled={isSubmitting}
        >
          Odustani
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="success"
          disabled={disableConfirm || isSubmitting}
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
