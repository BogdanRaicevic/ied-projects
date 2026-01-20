import {
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
} from "@mui/material";
import { Grid } from "@mui/system";
import { PRIJAVA_STATUS } from "ied-shared";
import { type Control, Controller } from "react-hook-form";

interface PrijaveRadioButtonsProps {
  name: string;
  control: Control;
  label: string;
  options: {
    all: string;
    subscribed: string;
    unsubscribed: string;
  };
}

export const PrijaveRadioButtons = ({
  name,
  control,
  label,
  options,
}: PrijaveRadioButtonsProps) => {
  return (
    <Grid size={3}>
      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
            const value = event.target.value;
            field.onChange(value);
          };

          return (
            <FormControl>
              <FormLabel>{label}</FormLabel>
              <RadioGroup value={field.value} onChange={handleChange}>
                <FormControlLabel
                  value={PRIJAVA_STATUS.all}
                  control={<Radio />}
                  label={options.all}
                />
                <FormControlLabel
                  value={PRIJAVA_STATUS.subscribed}
                  control={<Radio />}
                  label={options.subscribed}
                />
                <FormControlLabel
                  value={PRIJAVA_STATUS.unsubscribed}
                  control={<Radio />}
                  label={options.unsubscribed}
                />
              </RadioGroup>
            </FormControl>
          );
        }}
      />
    </Grid>
  );
};
