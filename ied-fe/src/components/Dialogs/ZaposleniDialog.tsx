import { Alert, Box, Dialog, DialogContent, DialogTitle } from "@mui/material";
import type { ZaposleniType } from "ied-shared";
import { ZaposleniForm } from "../Zaposleni/ZaposleniForm";

type ZaposleniDialogProps = {
  zaposleni?: ZaposleniType;
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ZaposleniType) => void;
  isSaving: boolean;
  errorMessage: string | null;
};

const ZaposleniDialog: React.FC<ZaposleniDialogProps> = ({
  zaposleni,
  open,
  onClose,
  onSubmit,
  isSaving,
  errorMessage,
}) => {
  return (
    <Dialog
      open={open}
      // Closing mid-save would let the old request's callbacks hit a reopened dialog.
      onClose={isSaving ? undefined : onClose}
      maxWidth="lg"
    >
      <DialogTitle>Zaposleni</DialogTitle>
      <DialogContent>
        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
        <Box sx={{ p: 2 }}>
          <ZaposleniForm
            zaposleni={zaposleni}
            onSubmit={onSubmit}
            isSaving={isSaving}
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ZaposleniDialog;
