import MenuItem from "@mui/material/MenuItem/MenuItem";
import Select from "@mui/material/Select/Select";
import { useEffect, useState } from "react";
import { ied, permanent, bs } from "./firmaData";

export default function SelectFirma({ onFirmaChange }: { onFirmaChange: (data: any) => void }) {
  const firmaOptions = [
    {
      name: "ied",
      data: ied,
    },
    {
      name: "permanent",
      data: permanent,
    },
    {
      name: "bs",
      data: bs,
    },
  ];

  const [firma, setFirma] = useState(firmaOptions[0]);

  useEffect(() => {
    onFirmaChange(firma.data);
  }, [firma]);

  const firmaItems = firmaOptions.map((f) => {
    return (
      <MenuItem key={f.name} value={f.name} onClick={() => setFirma(f)}>
        <img src={f.data.logo} style={{ maxWidth: "200px", width: "100%" }} />
      </MenuItem>
    );
  });

  return (
    <Select
      sx={{ maxWidth: 300 }}
      value={firma.name}
      onChange={(e) => {
        const selectedFirma = firmaOptions.find((f) => f.name === e.target.value);
        if (selectedFirma) {
          setFirma(selectedFirma);
        }
      }}
    >
      {firmaItems}
    </Select>
  );
}
