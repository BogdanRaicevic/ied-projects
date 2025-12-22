import { Autocomplete, Chip, TextField } from "@mui/material";
import { memo } from "react";

interface AutocompleteMultipleProps {
  data: string[];
  onCheckedChange: (checked: string[]) => void;
  placeholder: string;
  id: string;
  checkedValues: any[];
  getOptionLabel?: (option: any) => string; // Optional custom render
  renderTag?: (
    getTagProps: (props: { index: number }) => any,
    index: number,
    option: any,
  ) => React.ReactNode; // Optional custom render
}

export default memo(function AutocompleteCheckbox({
  data,
  onCheckedChange,
  placeholder,
  id,
  checkedValues,
  getOptionLabel,
  renderTag,
}: AutocompleteMultipleProps) {
  const handleChange = (_event: any, value: string[]) => {
    onCheckedChange(value);
  };

  const defaultGetOptionLabel = (option: any): string => {
    return typeof option === "string" ? option : String(option);
  };

  const defaultRenderTag = (
    getTagProps: (props: { index: number }) => any,
    index: number,
    option: string,
  ): React.ReactNode => {
    const { key, ...tagProps } = getTagProps({ index });
    return <Chip variant="outlined" label={option} key={key} {...tagProps} />;
  };

  return (
    <Autocomplete
      multiple
      id={`autocomplete-${id}`}
      disableCloseOnSelect
      getOptionLabel={getOptionLabel || defaultGetOptionLabel} // Use the getOptionLabel prop or default
      options={data || []}
      renderValue={(value: readonly string[], getTagProps) =>
        value.map((option: string, index: number) => {
          return (renderTag || defaultRenderTag)(getTagProps, index, option);
        })
      }
      renderInput={(params) => (
        <TextField {...params} placeholder={placeholder} />
      )}
      onChange={handleChange}
      value={checkedValues}
    />
  );
});
