import { Autocomplete, Checkbox, Chip, TextField } from "@mui/material";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { useState, memo } from "react";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

export default memo(function AutocompleteCheckbox({
  data,
  onCheckedChange,
  placeholder,
  id,
}: {
  data: string[];
  onCheckedChange: (checked: string[]) => void;
  placeholder: string;
  id: string;
}) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const handleChange = (_event: any, value: string[]) => {
    setSelectedOptions(value);
    onCheckedChange(value);
  };

  return (
    <Autocomplete
      multiple
      id={"autocomplete-" + id}
      disableCloseOnSelect
      getOptionLabel={(option) => option}
      options={data.map((option) => option)}
      renderTags={(value: readonly string[], getTagProps) =>
        value.map((option: string, index: number) => {
          const { key, ...tagProps } = getTagProps({ index });
          return <Chip variant="outlined" label={option} key={key} {...tagProps} />;
        })
      }
      renderOption={(props, option, { selected }) => {
        // eslint-disable-next-line react/prop-types
        const { key, ...theRest } = props as any;
        return (
          <li key={id + key} {...theRest}>
            <Checkbox
              id={id + option}
              icon={icon}
              checkedIcon={checkedIcon}
              style={{ marginRight: 8 }}
              checked={selected}
            />
            {option}
          </li>
        );
      }}
      renderInput={(params) => <TextField {...params} placeholder={placeholder} />}
      onChange={handleChange}
      value={selectedOptions}
    />
  );
});
