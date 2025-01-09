import { useState } from "react";
import { Zaposleni } from "../../schemas/firmaSchemas";
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
      // Only add the value if it doesn't already exist in the checked state
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };

  const handleClose = () => {
    onChecked(checked);
    onClose();
    setChecked([]);
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogContent>
        {zaposleni.map((osoba: Zaposleni) => (
          <FormControlLabel
            key={osoba._id}
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
