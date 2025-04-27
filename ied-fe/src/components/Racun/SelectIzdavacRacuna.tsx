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

  const selectedIzdavac = useRacunStore((state) => state.izdavacRacuna);
  const setIzdavacRacuna = useRacunStore((state) => state.setIzdavacRacuna);

  return (
    <Select
      sx={{ maxWidth: 300 }}
      value={selectedIzdavac}
      onChange={(e) => setIzdavacRacuna(e.target.value as string)}
    >
      {options.map((opt) => (
        <MenuItem key={opt.id} value={opt.id}>
          <img src={opt.logo} style={{ maxWidth: "200px", width: "100%" }} />
        </MenuItem>
      ))}
    </Select>
  );
}
