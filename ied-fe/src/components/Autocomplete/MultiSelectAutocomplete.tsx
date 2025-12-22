import { Autocomplete, Chip, TextField } from "@mui/material";
import { useCallback, useMemo } from "react";

interface MultiSelectAutocompleteProps<T> {
  labelKey: keyof T;
  options: T[];
  value: string[];
  onChange: (value: string[]) => void;
  inputLabel: string;
  inputPlaceholder: string;
}

/* Generic Multiple Autocomplete Component
 * T is a generic type that extends an object with at least an _id field
 */

export default function MultiSelectAutocomplete<T extends { _id: string }>({
  options,
  value,
  onChange,
  inputLabel,
  inputPlaceholder,
  labelKey,
}: MultiSelectAutocompleteProps<T>) {
  // Memoize selected options to avoid recalculating on every render
  const selectedOptions = useMemo(
    () => options.filter((opt) => value?.includes(opt._id)),
    [options, value],
  );

  // Memoize onChange handler to prevent unnecessary re-renders
  const handleChange = useCallback(
    (_event: any, newValue: T[]) => {
      onChange(newValue.map((item) => item._id));
    },
    [onChange],
  );

  // Memoize getOptionLabel to prevent recreation on every render
  const getOptionLabel = useCallback(
    (option: T) => String(option[labelKey]),
    [labelKey],
  );

  // Memoize isOptionEqualToValue for performance
  const isOptionEqualToValue = useCallback(
    (option: T, val: T) => option._id === val._id,
    [],
  );

  // Memoize renderTags for better performance
  const renderTags = useCallback(
    (
      tagValue: readonly T[],
      getTagProps: (props: { index: number }) => any,
    ) => {
      return tagValue.map((option, index) => {
        const { key, ...tagProps } = getTagProps({ index });
        return (
          <Chip
            variant="outlined"
            label={String(option[labelKey])}
            key={key}
            {...tagProps}
          />
        );
      });
    },
    [labelKey],
  );

  return (
    <Autocomplete
      multiple
      disableCloseOnSelect
      options={options}
      getOptionLabel={getOptionLabel}
      value={selectedOptions}
      onChange={handleChange}
      isOptionEqualToValue={isOptionEqualToValue}
      renderValue={renderTags}
      renderInput={(params) => (
        <TextField
          {...params}
          label={inputLabel}
          placeholder={inputPlaceholder}
        />
      )}
    />
  );
}
