import { useState } from "react";
import { Zaposleni } from "../../schemas/companySchemas";
import { Checkbox, Dialog, DialogContent, FormControlLabel } from "@mui/material";

type AddDialogProps = {
  open: boolean;
  onClose: () => void;
  onChecked: (checked: string[]) => void;
  zaposleni: Zaposleni[];
};

export default function AddAttendeeDialog({ open, onClose, onChecked, zaposleni }: AddDialogProps) {
  const [checked, setChecked] = useState<string[]>([]);

  const handleToggle = (value: string) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    console.log("newChecked: ", newChecked);

    setChecked(newChecked);
  };

  const handleClose = () => {
    onChecked(checked);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogContent>
        {zaposleni.map((osoba: Zaposleni) => (
          <FormControlLabel
            key={osoba.ime + osoba.prezime}
            control={
              <Checkbox
                checked={checked.indexOf(`${osoba.ime} ${osoba.prezime}`) !== -1}
                onChange={handleToggle(`${osoba.ime} ${osoba.prezime}`)}
              />
            }
            label={`${osoba.ime} ${osoba.prezime}`}
          />
        ))}
      </DialogContent>
    </Dialog>
  );
}
