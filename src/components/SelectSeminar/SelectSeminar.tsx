import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { fakeSeminars } from "../../fakeData/seminarsData";

export default function SelectSeminar({ onSeminarSelect }: { onSeminarSelect: (seminarId: string) => void }) {
  const handleChange = (event: SelectChangeEvent<{ value: unknown }>) => {
    console.log("item: ", event.target.value);
    onSeminarSelect(event.target.value as string);
  };

  return (
    <FormControl sx={{ width: "80%" }}>
      <InputLabel>Izaberi i dodaj Seminar</InputLabel>
      <Select value={""} label={"Izaberi Seminar"} onChange={handleChange}>
        {fakeSeminars.map((seminar) => (
          <MenuItem value={seminar.id} key={seminar.id}>
            {seminar.datum} - {seminar.naziv}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
