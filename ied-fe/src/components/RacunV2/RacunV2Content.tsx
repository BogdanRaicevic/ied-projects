import { Alert, Box, Grid, Stack } from "@mui/material";
import { type RacunV2Form, TipRacuna } from "ied-shared";
import { useState } from "react";
import { useWatch } from "react-hook-form";
import PageTitle from "../PageTitle";
import { useRacunV2Form } from "./hooks/useRacunV2Form";
import { AvansniLayout } from "./layouts/AvansniLayout";
import { KonacniLayout } from "./layouts/KonacniLayout";
import { PredracunLayout } from "./layouts/PredracunLayout";
import { RacunV2TabsShell } from "./RacunV2TabsShell";
import { SummaryPanel } from "./SummaryPanel";
import { IzdavacRacunaSection } from "./sections/IzdavacRacunaSection";
import { PrimalacRacunaSection } from "./sections/PrimalacRacunaSection";
import { StavkeSection } from "./sections/StavkeSection";

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
  const { control, handleSubmit, setValue } = useRacunV2Form();
  const [currencyWarningDismissed, setCurrencyWarningDismissed] =
    useState(false);
  const tipRacuna = useWatch({
    control,
    name: "tipRacuna",
    defaultValue: TipRacuna.PREDRACUN,
  });
  const valuta = useWatch({ control, name: "valuta", defaultValue: "RSD" });

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

              <FormColumnForTab tipRacuna={tipRacuna} />
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

/**
 * Dispatches the form-column content by `tipRacuna`. Stories 6.1 / 6.2 / 6.3
 * ship `PredracunLayout`, `AvansniLayout`, and `KonacniLayout`; 6.4 (racun)
 * replaces the remaining fallback branch below.
 *
 * The fallback still renders the three general sections so the racun tab is
 * usable during the transition. `StavkeSection` self-guards against the
 * avansni branch (no stavke on that type), so the fallback is safe — though
 * with 6.1–6.3 shipped, only `RACUN` reaches it.
 */
function FormColumnForTab({ tipRacuna }: { tipRacuna: TipRacuna }) {
  switch (tipRacuna) {
    case TipRacuna.PREDRACUN:
      return <PredracunLayout />;
    case TipRacuna.AVANSNI_RACUN:
      return <AvansniLayout />;
    case TipRacuna.KONACNI_RACUN:
      return <KonacniLayout />;
    default:
      return (
        <Stack spacing={3}>
          <Alert severity="info">
            Layout za <strong>{tipRacuna}</strong> dolazi kroz naredne epike. Za
            sada se prikazuju zajedničke sekcije.
          </Alert>
          <IzdavacRacunaSection />
          <PrimalacRacunaSection />
          <StavkeSection />
        </Stack>
      );
  }
}
