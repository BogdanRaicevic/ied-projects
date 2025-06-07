import { zodResolver } from "@hookform/resolvers/zod";
import {
  IzdavacRacuna,
  PretrageRacunaSchma,
  PretrageRacunaZodType,
  TipRacuna,
} from "@ied-shared/index";
import { Button, Chip, InputLabel, MenuItem, Select, TextField, Box } from "@mui/material";
import { blue, green, grey, purple, red } from "@mui/material/colors";
import { DatePicker } from "@mui/x-date-pickers";
import { subMonths } from "date-fns";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";

interface ParametriPretrageRacunaProps {
  onSearch: (filters: PretrageRacunaZodType) => void;
}

export const ParametriPretrageRacuna = ({ onSearch }: ParametriPretrageRacunaProps) => {
  const { control, handleSubmit } = useForm({
    defaultValues: {
      pozivNaBroj: undefined,
      tipRacuna: [],
      datumOd: subMonths(new Date(), 3),
      datumDo: new Date(),
      izdavacRacuna: [],
      nazivSeminara: "",
      imeFirme: "",
      pibFirme: undefined,
    },
    resolver: zodResolver(PretrageRacunaSchma),
  });

  const tipRacunaChips: Record<string, { label: string; color: string }> = {
    avansniRacun: { label: "Avans", color: green[200] },
    predracun: { label: "Predračun", color: red[300] },
    konacniRacun: { label: "Konačni Račun", color: blue[200] },
    racun: { label: "Račun", color: grey[300] },
  };

  const izdavacRacunaChips: Record<string, { label: string; color: string }> = {
    ied: { label: "IED", color: blue[500] },
    bs: { label: "BS", color: green[500] },
    permanent: { label: "Permanent", color: purple[500] },
  };

  const handlePretraziClick = (filters: PretrageRacunaZodType) => {
    onSearch(filters);
  };

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        // Prevent default form submission if this component is part of a <form>
        // event.preventDefault();
        handleSubmit(handlePretraziClick)();
      }
    };

    // Add event listener when the component mounts
    document.addEventListener("keydown", handleKeyPress);

    // Remove event listener when the component unmounts
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [handlePretraziClick]); // Re-run effect if handlePretraziClick changes (though it's stable here)

  return (
    <>
      <Box
        component="form"
        onSubmit={handleSubmit(handlePretraziClick)}
        sx={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 2 }}
      >
        <Controller
          name="pozivNaBroj"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Poziv na Broj"
              placeholder="Poziv na Broj"
              type="number"
              onChange={(e) => {
                const value = e.target.value;
                // If empty, set to undefined, otherwise convert to number
                field.onChange(value === "" ? undefined : Number(value));
              }}
            />
          )}
        />

        <Controller
          name="tipRacuna"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              displayEmpty
              multiple
              onChange={(e) => field.onChange(e.target.value as TipRacuna[])}
              renderValue={(selected = []) => {
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
          )}
        />
        <Controller
          name="datumOd"
          control={control}
          render={({ field }) => (
            <DatePicker
              label="Datum od"
              format="yyyy.MM.dd"
              value={field.value}
              disableFuture
              onChange={(e) => field.onChange(e)}
            />
          )}
        />
        <Controller
          name="datumDo"
          control={control}
          render={({ field }) => (
            <DatePicker
              label="Datum do"
              format="yyyy.MM.dd"
              value={field.value}
              disableFuture
              onChange={(e) => field.onChange(e)}
            />
          )}
        />

        <Controller
          name="izdavacRacuna"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              displayEmpty
              multiple
              onChange={(e) => field.onChange(e.target.value as IzdavacRacuna[])}
              renderValue={(selected = []) => {
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
          )}
        />
        <Controller
          name="nazivSeminara"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Naziv Seminara"
              placeholder="Naziv Seminara"
              onChange={(e) => {
                field.onChange(e.target.value);
              }}
            />
          )}
        />

        <Controller
          name="imeFirme"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Ime Firme"
              placeholder="Ime Firme"
              onChange={(e) => {
                field.onChange(e.target.value);
              }}
            />
          )}
        />

        <Controller
          name="pibFirme"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              placeholder="PIB Firme"
              label="PIB Firme"
              type="number"
              onChange={(e) => {
                const value = e.target.value;
                field.onChange(value === "" ? undefined : Number(value));
              }}
            />
          )}
        />
        <Button variant="contained" color="primary" sx={{ marginBottom: 2 }} type="submit">
          Pretraži
        </Button>
      </Box>
    </>
  );
};
