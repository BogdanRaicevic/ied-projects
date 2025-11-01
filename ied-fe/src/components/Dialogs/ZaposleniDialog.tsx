import { Box, Dialog, DialogContent, DialogTitle } from "@mui/material";
import type { ZaposleniType } from "ied-shared";
import { ZaposleniForm } from "../Zaposleni/ZaposleniFrom";

type ZaposleniDialogProps = {
  zaposleni?: ZaposleniType;
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ZaposleniType) => void;
};

const ZaposleniDialog: React.FC<ZaposleniDialogProps> = ({
  zaposleni,
  open,
  onClose,
  onSubmit,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg">
      <DialogTitle>Zaposleni</DialogTitle>
      <DialogContent>
        <Box sx={{ p: 2 }}>
          <ZaposleniForm zaposleni={zaposleni} onSubmit={onSubmit} />
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ZaposleniDialog;
