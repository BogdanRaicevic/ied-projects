import { Grid2, Divider, Typography, TextField } from "@mui/material";
import { forwardRef, useImperativeHandle, useCallback, useEffect } from "react";
import { PrimalacRacunaSection } from "./components/PrimalacRacunaSection";
import { useInitialRacunState } from "./hooks/useInitialRacunState";
import { useRacunCalculations } from "./hooks/useRacunCalculations";
import type { IzdavacRacuna, PrimalacRacuna, Racun } from "./types";
import { AvansSection } from "./components/AvansSection";

interface RacunFormRef {
  getRacunData: () => Partial<Racun>;
}

interface RacunFormProps {
  primalacRacuna: PrimalacRacuna;
  selectedFirmaData: IzdavacRacuna | null;
  selectedTekuciRacun: string;
}

export const CreateAvansForm = forwardRef<RacunFormRef, RacunFormProps>(
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

    return (
      <Grid2 container>
        <Grid2 size={12}>
          <Typography align="center" variant="h4" sx={{ mb: 3 }}>
            Avansni račun
            <TextField
              name="pozivNaBroj"
              value={racun.pozivNaBroj}
              size="small"
              sx={{ width: "150px", ml: 1 }}
              onChange={handleRacunChange}
            />
          </Typography>
          <PrimalacRacunaSection racun={racun} onRacunChange={handleRacunChange} />
          <Divider sx={{ mt: 3, mb: 3 }} />
          <AvansSection racun={racun} onRacunChange={handleRacunChange} />
        </Grid2>
      </Grid2>
    );
  }
);
