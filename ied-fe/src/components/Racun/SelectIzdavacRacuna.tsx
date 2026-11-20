import {
  FormControl,
  MenuItem,
  Select,
  type SelectChangeEvent,
  Tooltip,
} from "@mui/material";
import {
  IZDAVAC_RACUNA_LABELS,
  IzdavacRacuna,
  type IzdavacType,
} from "ied-shared";
import { useEffect } from "react";
import { useFetchIzdavaciRacuna } from "../../hooks/useFetchData";
import bsLogo from "../../images/bs-logo.png";
import iedLogo from "../../images/ied-logo.png";
import permanentLogo from "../../images/permanent-logo.png";
import { useRacunStore } from "./store/useRacunStore";

const LOGOS: Record<IzdavacRacuna, string> = {
  [IzdavacRacuna.IED]: iedLogo,
  [IzdavacRacuna.PERMANENT]: permanentLogo,
  [IzdavacRacuna.BS]: bsLogo,
};

const selectIzdavac = (izdavac: IzdavacType) => {
  const { updateField } = useRacunStore.getState();
  updateField("izdavacRacuna", izdavac.id);
  updateField("tekuciRacun", "");
  updateField("stopaPdv", izdavac.pdvObveznik ? 20 : 0);
};

export default function SelectIzdavacRacuna() {
  const { data: izdavaci = [] } = useFetchIzdavaciRacuna();
  const selectedIzdavac = useRacunStore(
    (state) => state.racunData.izdavacRacuna,
  );
  const pozivNaBroj = useRacunStore((state) => state.racunData.pozivNaBroj);

  const isDisabled = !!pozivNaBroj && pozivNaBroj !== "";

  // The store starts on IED; a server without IED in its database (only BS)
  // switches a new račun to its first izdavač.
  useEffect(() => {
    const [first] = izdavaci;
    if (
      first &&
      !isDisabled &&
      !izdavaci.some(({ id }) => id === selectedIzdavac)
    ) {
      selectIzdavac(first);
    }
  }, [izdavaci, isDisabled, selectedIzdavac]);

  const handleChange = (event: SelectChangeEvent<string>) => {
    const izdavac = izdavaci.find(({ id }) => id === event.target.value);
    if (izdavac) {
      selectIzdavac(izdavac);
    }
  };

  return (
    <FormControl fullWidth sx={{ mb: 2 }}>
      <Tooltip
        title={
          isDisabled
            ? "Izdavač se ne može promeniti nakon što je poziv na broj generisan"
            : ""
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
          {izdavaci.map(({ id }) => (
            <MenuItem key={id} value={id}>
              <img
                src={LOGOS[id]}
                alt={IZDAVAC_RACUNA_LABELS[id]}
                style={{ maxWidth: "200px", width: "100%" }}
              />
            </MenuItem>
          ))}
        </Select>
      </Tooltip>
    </FormControl>
  );
}
