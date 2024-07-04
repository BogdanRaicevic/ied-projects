import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Checkbox from "@mui/material/Checkbox";
import { useEffect, useState } from "react";
import { ListSubheader } from "@mui/material";

interface CheckboxListProps {
  data: string[];
  subheader: string;
  onCheckedChange: (checkedValues: string[]) => void;
}

export default function CheckboxList({ data, subheader, onCheckedChange }: CheckboxListProps) {
  const [checked, setChecked] = useState<number[]>([]);

  const handleToggle = (value: number) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };

  useEffect(() => {
    const checkedValues = checked.map((index) => data[index]);
    onCheckedChange(checkedValues);
  }, [checked, data, onCheckedChange]);

  return (
    <List
      sx={{ width: "100%", maxWidth: 360, maxHeight: 400, overflow: "auto" }}
      subheader={<ListSubheader>{subheader}</ListSubheader>}
    >
      {data.map((value, index) => {
        const labelId = `checkbox-list-label-${value}`;

        return (
          <ListItem key={value} disablePadding>
            <ListItemButton onClick={handleToggle(index)} dense>
              <ListItemIcon>
                <Checkbox
                  edge="start"
                  checked={checked.indexOf(index) !== -1}
                  tabIndex={-1}
                  disableRipple
                  inputProps={{ "aria-labelledby": labelId }}
                />
              </ListItemIcon>
              <ListItemText id={labelId} primary={`${value}`} />
            </ListItemButton>
          </ListItem>
        );
      })}
    </List>
  );
}
