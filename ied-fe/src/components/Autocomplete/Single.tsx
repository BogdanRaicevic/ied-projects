import {
  Autocomplete,
  type AutocompleteChangeDetails,
  type AutocompleteChangeReason,
  TextField,
} from "@mui/material";
import { memo, useEffect, useState } from "react";

interface AutocompleteSingleProps {
  data: string[];
  placeholder: string;
  preselected: string;
  onChange: (newValue: string) => void;
}

export default memo(function SingleAutocomplete({
  data,
  placeholder,
  preselected,
  onChange,
}: AutocompleteSingleProps) {
  const [selected, setSelected] = useState<string>(preselected || "");

  useEffect(() => {
    setSelected(preselected || "");
  }, [preselected]);

  const handleChange = (
    _event: React.SyntheticEvent<Element, Event>,
    newValue: string | null,
    _reason: AutocompleteChangeReason,
    _details?: AutocompleteChangeDetails<string>,
  ) => {
    setSelected(newValue ?? "");
    onChange(newValue ?? "");
  };

  return (
    <Autocomplete
      disablePortal
      options={data}
      renderInput={(params) => (
        <TextField {...params} placeholder={placeholder} label={placeholder} />
      )}
      onChange={handleChange}
      value={selected}
    />
  );
});
