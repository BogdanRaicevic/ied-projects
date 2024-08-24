import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Checkbox from "@mui/material/Checkbox";
import { useEffect, useState } from "react";
import { ListSubheader } from "@mui/material";
import { FixedSizeList, ListChildComponentProps } from "react-window";

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

  const renderRow = ({ index, style }: ListChildComponentProps) => {
    const value = data[index];
    const labelId = `checkbox-${subheader}-${value}`;
    return (
      <ListItem key={value} style={style} disablePadding>
        <ListItemButton onClick={handleToggle(value)} dense>
          <Checkbox
            edge="start"
            checked={checked.indexOf(value) !== -1}
            disableRipple
            id={labelId}
          />
          <ListItemText id={labelId} primary={`${value}`} />
        </ListItemButton>
      </ListItem>
    );
  };

  return (
    <div>
      <ListSubheader>{subheader}</ListSubheader>
      <FixedSizeList height={200} width={"100%"} itemSize={46} itemCount={data.length}>
        {renderRow}
      </FixedSizeList>
    </div>
  );
}
