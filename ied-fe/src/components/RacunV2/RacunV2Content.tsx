import { Alert, Box, Stack } from "@mui/material";
import { TipRacuna } from "ied-shared";
import { useState } from "react";
import PageTitle from "../PageTitle";
import { useRacunV2Form } from "./hooks/useRacunV2Form";
import { RacunV2TabsShell } from "./RacunV2TabsShell";
import { IzdavacRacunaSection } from "./sections/IzdavacRacunaSection";

export function RacunV2Content() {
  const { setValue, watch } = useRacunV2Form();
  const [currencyWarningDismissed, setCurrencyWarningDismissed] =
    useState(false);
  const tipRacuna = watch("tipRacuna", TipRacuna.PREDRACUN);
  const valuta = watch("valuta", "RSD");

  const handleTabChange = (nextTab: TipRacuna) => {
    setValue("tipRacuna", nextTab, { shouldDirty: true, shouldTouch: true });
  };

  return (
    <>
      <PageTitle title="Računi V2" />

      <RacunV2TabsShell currentTab={tipRacuna} onTabChange={handleTabChange} />

      <Stack spacing={3} sx={{ mt: 3 }}>
        {valuta === "EUR" && !currencyWarningDismissed ? (
          <Alert
            severity="warning"
            onClose={() => setCurrencyWarningDismissed(true)}
          >
            Prikaz valute je samo vizuelni. NBS kurs, PDV rezim izvoza i
            dvojezican DOCX dolaze u Phase 6.
          </Alert>
        ) : null}

        <IzdavacRacunaSection />

        <Box>
          <Alert severity="info">
            Aktivan tab: <strong>{tipRacuna}</strong>. Story 4.1 je aktivan;
            ostale sekcije dolaze kroz naredne epike.
          </Alert>
        </Box>
      </Stack>
    </>
  );
}
