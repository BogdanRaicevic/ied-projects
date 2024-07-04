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

  const renderRow = ({ index, style }: ListChildComponentProps) => {
    const value = data[index];
    const labelId = `checkbox-${subheader}-${value}`;

    return (
      <ListItem key={value} style={style} disablePadding>
        <ListItemButton onClick={handleToggle(index)} dense>
          <Checkbox
            edge="start"
            checked={checked.indexOf(index) !== -1}
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
      <FixedSizeList height={360} width={360} itemSize={46} itemCount={data.length}>
        {renderRow}
      </FixedSizeList>
    </div>
  );
}
