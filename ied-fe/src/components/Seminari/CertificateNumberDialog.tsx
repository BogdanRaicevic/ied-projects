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
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import {
  type SertifikatTemplateKeyType,
  SertifikatTemplateKeyValues,
} from "ied-shared";
import { useEffect, useState } from "react";

export type CertificateDialogSubmitValues = {
  certificateNumber: number;
  templateKey: SertifikatTemplateKeyType;
};

type CertificateNumberDialogProps = {
  open: boolean;
  title: string;
  inputLabel: string;
  templateLabel?: string;
  description?: string;
  alertMessages?: string[];
  alertSeverity?: AlertColor;
  confirmLabel?: string;
  disableConfirm?: boolean;
  isSubmitting?: boolean;
  onClose: () => void;
  onConfirm: (values: CertificateDialogSubmitValues) => Promise<void> | void;
};

const templateLabels: Record<SertifikatTemplateKeyType, string> = {
  bs: "BS",
  ied: "IED",
  perm: "PERM",
};

export default function CertificateNumberDialog({
  open,
  title,
  inputLabel,
  templateLabel = "Šablon sertifikata",
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
  const [templateKey, setTemplateKey] =
    useState<SertifikatTemplateKeyType | null>(null);
  const [inputError, setInputError] = useState("");
  const [templateError, setTemplateError] = useState("");

  useEffect(() => {
    if (open) {
      setCertificateNumber("");
      setTemplateKey(null);
      setInputError("");
      setTemplateError("");
    }
  }, [open]);

  const handleConfirm = async () => {
    if (!templateKey) {
      setTemplateError("Izaberite šablon sertifikata.");
      return;
    }

    const parsedValue = Number.parseInt(certificateNumber.trim(), 10);

    if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
      setInputError("Broj sertifikata mora biti pozitivan ceo broj.");
      return;
    }

    setInputError("");
    setTemplateError("");
    await onConfirm({
      certificateNumber: parsedValue,
      templateKey,
    });
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

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {templateLabel}
            </Typography>
            <ToggleButtonGroup
              exclusive
              value={templateKey}
              onChange={(_, value: SertifikatTemplateKeyType | null) => {
                setTemplateKey(value);
                setTemplateError("");
              }}
              disabled={isSubmitting}
              fullWidth
            >
              {SertifikatTemplateKeyValues.map((templateValue) => (
                <ToggleButton key={templateValue} value={templateValue}>
                  {templateLabels[templateValue]}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
            {templateError ? (
              <Typography variant="caption" color="error">
                {templateError}
              </Typography>
            ) : null}
          </Box>

          <TextField
            autoFocus
            fullWidth
            type="number"
            label={inputLabel}
            value={certificateNumber}
            onChange={(event) => setCertificateNumber(event.target.value)}
            error={Boolean(inputError)}
            helperText={inputError}
            slotProps={{ htmlInput: { min: 1, step: 1 } }}
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
