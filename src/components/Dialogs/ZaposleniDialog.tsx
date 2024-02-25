import React from "react";
import { Dialog, DialogTitle, DialogContent, Box } from "@mui/material";
import { Zaposleni } from "../../schemas/companySchemas";
import { ZaposleniForm } from "../Zaposleni/ZaposleniFrom";

type ZaposleniDialogProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Zaposleni) => void;
};

const ZaposleniDialog: React.FC<ZaposleniDialogProps> = ({ open, onClose, onSubmit }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg">
      <DialogTitle>Zaposleni</DialogTitle>
      <DialogContent>
        <Box sx={{ p: 2 }}>
          <ZaposleniForm onSubmit={onSubmit} />
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ZaposleniDialog;
