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
  checkedValues: string[];
}

export default function CheckboxList({
  data,
  subheader,
  onCheckedChange,
  checkedValues,
}: CheckboxListProps) {
  const [checked, setChecked] = useState<string[]>(checkedValues);

  const handleToggle = (value: string) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
    onCheckedChange(newChecked);
  };

  useEffect(() => {
    setChecked(checkedValues);
  }, [checkedValues]);

  useEffect(() => {
    onCheckedChange(checkedValues);
  }, [checked, onCheckedChange]);

  return (
    <List subheader={<ListSubheader>{subheader}</ListSubheader>}>
      {data.map((value) => {
        const labelId = `checkbox-${subheader}-${value}`;
        return (
          <ListItem key={value} disablePadding>
            <ListItemButton onClick={handleToggle(value)} dense>
              <ListItemIcon>
                <Checkbox
                  edge="start"
                  checked={checked.indexOf(value) !== -1}
                  disableRipple
                  inputProps={{ "aria-labelledby": labelId }}
                  id={labelId}
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
