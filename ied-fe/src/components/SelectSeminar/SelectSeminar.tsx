import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { useState } from "react";

export default function SelectSeminar({
  onSeminarSelect,
}: {
  onSeminarSelect: (seminarId: string) => void;
}) {
  const [seminar, setSeminar] = useState<string>("");
  const handleChange = (event: SelectChangeEvent<{ value: unknown }>) => {
    console.log("item: ", event.target.value);
    setSeminar(event.target.value as string);
    onSeminarSelect(event.target.value as string);
  };

  return (
    <FormControl fullWidth>
      <InputLabel>Izaberi i dodaj Seminar</InputLabel>
      {/* <Select value={seminar as any} label={"Izaberi Seminar"} onChange={handleChange}>
        {fakeSeminarsOnFirma.map((seminar) => (
          <MenuItem value={seminar.id} key={seminar.id}>
            {seminar.datum} - {seminar.naziv}
          </MenuItem>
        ))}
      </Select> */}
    </FormControl>
  );
}
