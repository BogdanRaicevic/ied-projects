import * as React from "react";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import { IndeterminateCheckBox } from "@mui/icons-material";

interface IndeterminateCheckboxProps {
  options: {
    parent: string;
    children?: string[];
  };
}

export default function IndeterminateCheckbox({ options }: IndeterminateCheckboxProps) {
  const [checked, setChecked] = React.useState(() =>
    new Array(options.children?.length).fill(false)
  );

  const handleChangeParent = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(new Array(options.children?.length).fill(event.target.checked));
  };

  const handleChangeChild = (index: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const newChecked = [...checked];
    newChecked[index] = event.target.checked;
    setChecked(newChecked);
  };

  const childrenCheckboxes = (
    <Box sx={{ display: "flex", flexDirection: "column", ml: 3 }}>
      {options.children?.map((child, index) => (
        <FormControlLabel
          key={index}
          label={child}
          control={<Checkbox checked={checked[index]} onChange={handleChangeChild(index)} />}
        />
      ))}
    </Box>
  );

  return (
    <div>
      <FormControlLabel
        label={options.parent}
        control={
          <Checkbox
            checked={checked.every((value) => value)}
            indeterminate={checked.some((value) => value) && !checked.every((value) => value)}
            onChange={handleChangeParent}
            indeterminateIcon={<IndeterminateCheckBox style={{ color: "orange" }} />}
          />
        }
      />
      {childrenCheckboxes}
    </div>
  );
}
