import { Grid2, Divider, Typography, TextField, Box, FormControl } from "@mui/material";
import { forwardRef, useImperativeHandle, useCallback, useEffect } from "react";
import { PrimalacRacunaSection } from "./components/PrimalacRacunaSection";
import { useInitialRacunState } from "./hooks/useInitialRacunState";
import { useRacunCalculations } from "./hooks/useRacunCalculations";
import type { IzdavacRacuna, PrimalacRacuna, Racun } from "./types";
import { AvansSection } from "./components/AvansSection";
import { OfflinePrisustvaSection } from "./components/OfflinePrisustvaSection";
import { OnlinePrisustvaSection } from "./components/OnlinePrisustvaSection";
import { UkupnaNaknada } from "./UkupnaNaknada";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

interface RacunFormRef {
  getRacunData: () => Partial<Racun>;
}

interface RacunFormProps {
  primalacRacuna: PrimalacRacuna;
  selectedFirmaData: IzdavacRacuna | null;
  selectedTekuciRacun: string;
}

export const CreateKonacniRacunForm = forwardRef<RacunFormRef, RacunFormProps>(
  ({ primalacRacuna, selectedFirmaData, selectedTekuciRacun }, ref) => {
    const { racun, setRacun } = useInitialRacunState({ primalacRacuna, selectedFirmaData });

    useEffect(() => {
      setRacun((prev) => ({ ...prev, tekuciRacun: selectedTekuciRacun }));
    }, [selectedTekuciRacun]);

    const handleCalculationsUpdate = useCallback((calculations: Partial<Racun>) => {
      setRacun((prev) => ({ ...prev, ...calculations }));
    }, []);

    useRacunCalculations({
      racun,
      onCalculationsUpdate: handleCalculationsUpdate,
    });

    const handleRacunChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setRacun((prev) => ({
          ...prev,
          [e.target.name]: e.target.value,
        }));
      },
      []
    );

    useImperativeHandle(ref, () => ({
      getRacunData: () => racun,
    }));

    const handleDateChange = (filedName: string, date: Date | null) => {
      setRacun((prev) => ({
        ...prev,
        [filedName]: date,
      }));
    };

    console.log("racun je:", racun);

    return (
      <Grid2 container>
        <Grid2 size={12}>
          <Box
            sx={{ display: "flex", alignItems: "center", justifyContent: "center", mb: 3, gap: 2 }}
          >
            <Typography variant="h4">Konačni račun</Typography>
            <TextField
              name="pozivNaBroj"
              placeholder="Poziv na broj"
              value={racun.pozivNaBroj}
              size="small"
              sx={{ width: "150px" }}
              onChange={handleRacunChange}
            />
          </Box>
          <Box
            sx={{ display: "flex", alignItems: "center", justifyContent: "center", mb: 3, gap: 2 }}
          >
            <FormControl sx={{ m: 1 }}>
              <DatePicker
                format="dd.MM.yyyy"
                label="Datum prometa usluge"
                name="datumPrometaUsluge"
                value={racun.datumPrometaUsluge ? new Date(racun.datumPrometaUsluge) : null}
                onChange={(date) => handleDateChange("datumPrometaUsluge", date)}
              />
            </FormControl>
          </Box>
          <PrimalacRacunaSection racun={racun} onRacunChange={handleRacunChange} />
          <Divider sx={{ mt: 3, mb: 3 }} />
          <OnlinePrisustvaSection racun={racun} onRacunChange={handleRacunChange} />
          <OfflinePrisustvaSection racun={racun} onRacunChange={handleRacunChange} />
          <AvansSection racun={racun} onRacunChange={handleRacunChange} />
          <UkupnaNaknada racun={racun} onRacunChange={handleRacunChange} />
          <Divider sx={{ mt: 3 }} />
        </Grid2>
      </Grid2>
    );
  }
);
