import { Autocomplete, Chip, TextField } from "@mui/material";
import { useState, memo, useEffect } from "react";

interface AutocompleteMultipleProps {
  data: string[];
  onCheckedChange: (checked: string[]) => void;
  placeholder: string;
  id: string;
  checkedValues: string[];
}

export default memo(function AutocompleteCheckbox({
  data,
  onCheckedChange,
  placeholder,
  id,
  checkedValues,
}: AutocompleteMultipleProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>(checkedValues);

  useEffect(() => {
    setSelectedOptions(checkedValues);
  }, [checkedValues]);

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
      renderInput={(params) => <TextField {...params} placeholder={placeholder} />}
      onChange={handleChange}
      value={selectedOptions}
    />
  );
});
