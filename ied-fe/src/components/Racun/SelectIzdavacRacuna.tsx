import iedLogo from "../../images/ied-logo.png";
import permanentLogo from "../../images/permanent-logo.png";
import bsLogo from "../../images/bs-logo.png";
import { useRacunStore } from "./store/useRacunStore";
import { IzdavacRacuna } from "@ied-shared/index";
import { FormControl, MenuItem, Select, SelectChangeEvent, Tooltip } from "@mui/material";

export default function SelectIzdavacRacuna() {
  const options = [
    { id: "ied", logo: iedLogo },
    { id: "permanent", logo: permanentLogo },
    { id: "bs", logo: bsLogo },
  ];

  const selectedIzdavac = useRacunStore((state) => state.racunData.izdavacRacuna);
  const pozivNaBroj = useRacunStore((state) => state.racunData.pozivNaBroj);
  const updateField = useRacunStore((state) => state.updateField);

  const handleChange = (event: SelectChangeEvent<string>) => {
    const selectedValue = event.target.value as IzdavacRacuna;
    updateField("izdavacRacuna", selectedValue);
    updateField("tekuciRacun", "");
    updateField("stopaPdv", selectedValue === "permanent" ? 0 : 20);
  };

  const isDisabled = !!pozivNaBroj && pozivNaBroj !== "";

  return (
    <FormControl fullWidth sx={{ mb: 2 }}>
      <Tooltip
        title={
          isDisabled ? "Izdavač se ne može promeniti nakon što je poziv na broj generisan" : ""
        }
        arrow
        placement="top"
      >
        <Select
          sx={{ maxWidth: 300, maxHeight: 70 }}
          value={selectedIzdavac}
          onChange={handleChange}
          disabled={isDisabled}
          variant={isDisabled ? "filled" : "outlined"}
        >
          {options.map((opt) => (
            <MenuItem key={opt.id} value={opt.id}>
              <img src={opt.logo} style={{ maxWidth: "200px", width: "100%" }} />
            </MenuItem>
          ))}
        </Select>
      </Tooltip>
    </FormControl>
  );
}
