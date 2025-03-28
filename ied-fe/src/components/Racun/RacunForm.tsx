import { Grid2, Paper, Divider, TableContainer, Table } from "@mui/material";
import { useState, forwardRef, useImperativeHandle, useCallback } from "react";
import { IzdavacRacunaSection } from "./IzdavacRacunaSection";
import { PrimalacRacunaSection } from "./PrimalacRacunaSection";
import { OnlinePrisustvaSection } from "./OnlinePrisustvaSection";
import { OfflinePrisustvaSection } from "./OfflinePrisustvaSection";
import { UkupnaNaknada } from "./UkupnaNaknada";
import { useInitialRacunState } from "./hooks/useInitialRacunState";
import { useRacunCalculations } from "./hooks/useRacunCalculations";
import type { RacunFormRef, RacunFormProps, IzdavacRacuna, Racun } from "./types";

export const RacunForm = forwardRef<RacunFormRef, RacunFormProps>(({ primalacRacuna }, ref) => {
  const [selectedFirmaData, setSelectedFirmaData] = useState<IzdavacRacuna | null>(null);
  const { racun, setRacun } = useInitialRacunState({ primalacRacuna, selectedFirmaData });

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

  const handleFirmaChange = useCallback((data: IzdavacRacuna | null) => {
    setSelectedFirmaData(data);
  }, []);

  const handleTekuciRacunChange = useCallback((value: string) => {
    setRacun((prev) => ({ ...prev, tekuciRacun: value }));
  }, []);

  useImperativeHandle(ref, () => ({
    getRacunData: () => racun,
  }));

  return (
    <Grid2 container>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <IzdavacRacunaSection
            selectedFirmaData={selectedFirmaData}
            onFirmaChange={handleFirmaChange}
            onTekuciRacunChange={handleTekuciRacunChange}
          />
        </Table>
      </TableContainer>
      <Grid2 size={12}>
        <Divider sx={{ mt: 3, mb: 3 }} />
        <PrimalacRacunaSection racun={racun} onRacunChange={handleRacunChange} />
        <Divider sx={{ mt: 3, mb: 3 }} />
        <OnlinePrisustvaSection racun={racun} onRacunChange={handleRacunChange} />
        <OfflinePrisustvaSection racun={racun} onRacunChange={handleRacunChange} />
        <UkupnaNaknada racun={racun} onRacunChange={handleRacunChange} />
        <Divider sx={{ mt: 3 }} />
      </Grid2>
    </Grid2>
  );
});
