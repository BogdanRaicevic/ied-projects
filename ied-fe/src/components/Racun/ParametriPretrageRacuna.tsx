import { IzdavacRacuna, PretrageRacunaZodType, TipRacuna } from "@ied-shared/index";
import { Button, Chip, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import { blue, green, purple, red } from "@mui/material/colors";
import { Box } from "@mui/system";
import { DatePicker } from "@mui/x-date-pickers";
import { subMonths } from "date-fns";
import { useState } from "react";

interface ParametriPretrageRacunaProps {
  onSearch: (filters: PretrageRacunaZodType) => void;
}

export const ParametriPretrageRacuna = ({ onSearch }: ParametriPretrageRacunaProps) => {
  const [pozivNaBroj, setPozivNaBroj] = useState<number>();
  const [datumOd, setDatumOd] = useState<Date | null>(subMonths(new Date(), 3));
  const [datumDo, setDatumDo] = useState<Date | null>(new Date());
  const [selectedIzdavac, setSelectedIzdavac] = useState<IzdavacRacuna[]>([]);
  const [selectedTipRacuna, setSelectedTipRacuna] = useState<TipRacuna[]>([]);
  const [imeFirme, setImeFirme] = useState<string>("");
  const [pibFirme, setPibFirme] = useState<number>();
  const [nazivSeminara, setNazivSeminara] = useState<string>("");

  const tipRacunaChips: Record<string, { label: string; color: string }> = {
    avansniRacun: { label: "Avans", color: green[200] },
    predracun: { label: "Predračun", color: red[300] },
    konacniRacun: { label: "Konačni Račun", color: blue[200] },
  };

  const izdavacRacunaChips: Record<string, { label: string; color: string }> = {
    ied: { label: "IED", color: blue[500] },
    bs: { label: "BS", color: green[500] },
    permanent: { label: "Permanent", color: purple[500] },
  };

  const handlePretraziClick = () => {
    const filters: PretrageRacunaZodType = {
      pozivNaBroj: pozivNaBroj || undefined,
      datumOd: datumOd || undefined,
      datumDo: datumDo || undefined,
      izdavacRacuna: selectedIzdavac || undefined,
      tipRacuna: selectedTipRacuna || undefined,
      imeFirme: imeFirme || undefined,
      pibFirme: pibFirme || undefined,
      nazivSeminara: nazivSeminara || undefined,
    };

    onSearch(filters);
  };

  return (
    <>
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 2 }}>
        <TextField
          label="Poziv na Broj"
          placeholder="Poziv na Broj"
          value={pozivNaBroj === undefined ? "" : pozivNaBroj} // Display empty string when undefined
          type="number"
          onChange={(e) => {
            const value = e.target.value;
            // If empty, set to undefined, otherwise convert to number
            setPozivNaBroj(value === "" ? undefined : Number(value));
          }}
        />
        <Select
          displayEmpty
          multiple
          value={selectedTipRacuna}
          onChange={(e) => setSelectedTipRacuna(e.target.value as TipRacuna[])}
          renderValue={(selected) => {
            if ((selected as string[]).length === 0) {
              return <InputLabel>Tip Računa</InputLabel>;
            }

            return (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {(selected as string[]).map((val) => {
                  const cfg = tipRacunaChips[val];
                  return (
                    <Chip
                      key={val}
                      label={cfg?.label ?? val}
                      size="small"
                      sx={{ bgcolor: cfg?.color, color: "#fff" }}
                    />
                  );
                })}
              </Box>
            );
          }}
        >
          {Object.entries(tipRacunaChips).map(([value, cfg]) => (
            <MenuItem key={value} value={value}>
              <Chip label={cfg.label} size="small" sx={{ bgcolor: cfg.color, color: "#fff" }} />
            </MenuItem>
          ))}
        </Select>
        <DatePicker
          label="Datum od"
          format="yyyy.MM.dd"
          value={datumOd}
          onChange={(e) => setDatumOd(e)}
        />
        <DatePicker
          label="Datum do"
          format="yyyy.MM.dd"
          value={datumDo}
          disableFuture
          onChange={(e) => setDatumDo(e)}
        />
        <Select
          displayEmpty
          multiple
          value={selectedIzdavac}
          onChange={(e) => setSelectedIzdavac(e.target.value as IzdavacRacuna[])}
          renderValue={(selected) => {
            if ((selected as string[]).length === 0) {
              return <InputLabel>Izdavač računa</InputLabel>;
            }

            return (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {(selected as string[]).map((val) => {
                  const cfg = izdavacRacunaChips[val];
                  return (
                    <Chip
                      key={val}
                      label={cfg?.label ?? val}
                      size="small"
                      sx={{ bgcolor: cfg?.color, color: "#fff" }}
                    />
                  );
                })}
              </Box>
            );
          }}
        >
          {Object.entries(izdavacRacunaChips).map(([value, cfg]) => (
            <MenuItem key={value} value={value}>
              <Chip label={cfg.label} size="small" sx={{ bgcolor: cfg.color, color: "#fff" }} />
            </MenuItem>
          ))}
        </Select>
        <TextField
          label="Naziv Seminara"
          placeholder="nazivSeminara"
          value={nazivSeminara}
          onChange={(e) => setNazivSeminara(e.target.value)}
        />
        <TextField
          placeholder="Ime Firme"
          label="Ime Firme"
          value={imeFirme}
          onChange={(e) => setImeFirme(e.target.value)}
        />
        <TextField
          placeholder="PIB Firme"
          label="PIB Firme"
          value={pibFirme === undefined ? "" : pibFirme} // Display empty string when undefined
          type="number"
          onChange={(e) => {
            const value = e.target.value;
            // If empty, set to undefined, otherwise convert to number
            setPibFirme(value === "" ? undefined : Number(value));
          }}
        />
      </Box>
      <Button
        variant="contained"
        color="primary"
        sx={{ marginTop: 2, marginBottom: 2 }}
        onClick={handlePretraziClick}
      >
        Pretraži
      </Button>
    </>
  );
};
