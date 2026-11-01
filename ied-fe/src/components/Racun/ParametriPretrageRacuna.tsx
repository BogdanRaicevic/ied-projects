import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { subMonths } from "date-fns";
import {
  IZDAVAC_RACUNA_LABELS,
  type IzdavacRacuna,
  type PretrageRacunaType,
  PretrageRacunaZod,
  TIP_RACUNA_LABELS,
  type TipRacuna,
} from "ied-shared";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { IzdavacRacunaChip, TipRacunaChip } from "./RacunChips";

interface ParametriPretrageRacunaProps {
  onSearch: (filters: PretrageRacunaType) => void;
}

export const ParametriPretrageRacuna = ({
  onSearch,
}: ParametriPretrageRacunaProps) => {
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
    resolver: zodResolver(PretrageRacunaZod),
  });

  const handlePretraziClick = (filters: PretrageRacunaType) => {
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
  }, [handleSubmit]);

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(handlePretraziClick)}
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(4, minmax(0,1fr))",
        gap: 2,
      }}
    >
      <Controller
        name="pozivNaBroj"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Poziv na Broj"
            placeholder="Poziv na Broj"
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
                  {(selected as string[]).map((val) => (
                    <TipRacunaChip key={val} tip={val} />
                  ))}
                </Box>
              );
            }}
          >
            {Object.keys(TIP_RACUNA_LABELS).map((value) => (
              <MenuItem key={value} value={value}>
                <TipRacunaChip tip={value} />
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
            value={field.value as Date | null}
            disableFuture
            onChange={(e) => field.onChange(e ?? undefined)}
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
            value={field.value as Date | null}
            disableFuture
            onChange={(e) => field.onChange(e ?? undefined)}
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
                  {(selected as string[]).map((val) => (
                    <IzdavacRacunaChip key={val} izdavac={val} />
                  ))}
                </Box>
              );
            }}
          >
            {Object.keys(IZDAVAC_RACUNA_LABELS).map((value) => (
              <MenuItem key={value} value={value}>
                <IzdavacRacunaChip izdavac={value} />
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
          />
        )}
      />

      <Controller
        name="imeFirme"
        control={control}
        render={({ field }) => (
          <TextField {...field} label="Ime Firme" placeholder="Ime Firme" />
        )}
      />

      <Controller
        name="pibFirme"
        control={control}
        render={({ field }) => (
          <TextField {...field} placeholder="PIB Firme" label="PIB Firme" />
        )}
      />
      <Button
        variant="contained"
        color="primary"
        sx={{ marginBottom: 2 }}
        type="submit"
      >
        Pretraži
      </Button>
    </Box>
  );
};
