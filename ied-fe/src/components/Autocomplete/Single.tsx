import { Autocomplete, TextField } from "@mui/material";
import { memo, useEffect, useState } from "react";

interface AutocompleteSingleProps {
  data: string[];
  placeholder: string;
  id: string;
  preselected: string;
}

export default memo(function SingleAutocomplete({
  data,
  placeholder,
  id,
  preselected,
}: AutocompleteSingleProps) {
  const [selected, setSelected] = useState<string>(preselected || "");

  useEffect(() => {
    setSelected(preselected || "");
  }, [preselected]);

  return (
    <Autocomplete
      id={"single-autocomplete-" + id}
      disablePortal
      options={data}
      renderInput={(params) => (
        <TextField {...params} placeholder={placeholder} label={placeholder} />
      )}
      onChange={(event: any, newValue: any) => setSelected(newValue)}
      value={selected}
    />
  );
});
