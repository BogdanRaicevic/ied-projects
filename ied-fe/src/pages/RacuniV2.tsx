import { Alert, Box } from "@mui/material";
import { TipRacuna } from "ied-shared";
import { useState } from "react";
import PageTitle from "../components/PageTitle";
import { RacunV2TabsShell } from "../components/RacunV2/RacunV2TabsShell";

export default function RacuniV2() {
  // Local state for now. In Epic 2 this moves into the react-hook-form
  // RacunV2FormProvider so `tipRacuna` lives in the form state alongside the
  // rest of the invoice data.
  const [tipRacuna, setTipRacuna] = useState<TipRacuna>(TipRacuna.PREDRACUN);

  return (
    <>
      <PageTitle title="Računi V2" />

      <RacunV2TabsShell currentTab={tipRacuna} onTabChange={setTipRacuna} />

      <Box sx={{ mt: 3 }}>
        <Alert severity="info">
          Aktivan tab: <strong>{tipRacuna}</strong>. Forma se gradi u Epicu 2
          (react-hook-form shell).
        </Alert>
      </Box>
    </>
  );
}
