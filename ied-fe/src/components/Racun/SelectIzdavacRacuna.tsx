import MenuItem from "@mui/material/MenuItem/MenuItem";
import Select from "@mui/material/Select/Select";
import iedLogo from "../../images/ied-logo.png";
import permanentLogo from "../../images/permanent-logo.png";
import bsLogo from "../../images/bs-logo.png";
import { useRacunStore } from "./store/useRacunStore";

export default function SelectIzdavacRacuna() {
  const options = [
    { id: "ied", logo: iedLogo },
    { id: "permanent", logo: permanentLogo },
    { id: "bs", logo: bsLogo },
  ];

  const selectedIzdavac = useRacunStore((state) => state.racunData.izdavacRacuna);
  const updateField = useRacunStore((state) => state.updateField);

  return (
    <Select
      sx={{ maxWidth: 300, maxHeight: 70 }}
      value={selectedIzdavac}
      onChange={(e) => updateField("izdavacRacuna", e.target.value as string)}
    >
      {options.map((opt) => (
        <MenuItem key={opt.id} value={opt.id}>
          <img src={opt.logo} style={{ maxWidth: "200px", width: "100%" }} />
        </MenuItem>
      ))}
    </Select>
  );
}
