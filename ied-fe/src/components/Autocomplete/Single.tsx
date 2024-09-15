import { Autocomplete, TextField } from "@mui/material";
import { memo } from "react";

interface AutocompleteSingleProps {
  data: string[];
  placeholder: string;
  id: string;
}

export default memo(function SingleAutocomplete({
  data,
  placeholder,
  id,
}: AutocompleteSingleProps) {
  return (
    <Autocomplete
      id={"single-autocomplete-" + id}
      disablePortal
      options={data}
      renderInput={(params) => <TextField {...params} placeholder={placeholder} />}
    />
  );
});
