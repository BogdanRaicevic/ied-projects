import { Alert, Box, Grid, Stack } from "@mui/material";
import { type RacunV2Form, TipRacuna } from "ied-shared";
import { useState } from "react";
import PageTitle from "../PageTitle";
import { useRacunV2Form } from "./hooks/useRacunV2Form";
import { RacunV2TabsShell } from "./RacunV2TabsShell";
import { SummaryPanel } from "./SummaryPanel";
import { IzdavacRacunaSection } from "./sections/IzdavacRacunaSection";
import { PrimalacRacunaSection } from "./sections/PrimalacRacunaSection";

/**
 * Phase 1 stub submit handler. Wired so RHF's `handleSubmit` actually fires
 * (which is what flips `formState.isSubmitting`, which is what disables the
 * SummaryPanel CTA per ticket 4.3.5). Epic 8 replaces this with the real
 * submit (POST → BE → navigate to preview).
 */
const stubOnSubmit = async (data: RacunV2Form): Promise<void> => {
  console.warn(
    "[RacunV2] Submit handler not implemented yet — Epic 8 will wire the real flow.",
    data,
  );
};

export function RacunV2Content() {
  const { handleSubmit, setValue, watch } = useRacunV2Form();
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

      <Box
        component="form"
        onSubmit={handleSubmit(stubOnSubmit)}
        noValidate
        sx={{ mt: 3 }}
      >
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Stack spacing={3}>
              {valuta === "EUR" && !currencyWarningDismissed ? (
                <Alert
                  severity="warning"
                  onClose={() => setCurrencyWarningDismissed(true)}
                >
                  Prikaz valute je samo vizuelni. NBS kurs, PDV režim izvoza i
                  dvojezičan DOCX dolaze u Phase 6.
                </Alert>
              ) : null}

              <IzdavacRacunaSection />

              <PrimalacRacunaSection />

              <Alert severity="info">
                Aktivan tab: <strong>{tipRacuna}</strong>. Story 4.3 je aktivna;
                ostale sekcije dolaze kroz naredne epike.
              </Alert>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <SummaryPanel />
          </Grid>
        </Grid>
      </Box>
    </>
  );
}
