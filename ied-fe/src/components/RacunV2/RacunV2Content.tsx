import { Alert, Box, Grid, Stack } from "@mui/material";
import { type RacunV2Form, TipRacuna } from "ied-shared";
import { useState } from "react";
import { useWatch } from "react-hook-form";
import { submitRacunV2ForGeneration } from "../../api/racuni_v2.api";
import PageTitle from "../PageTitle";
import { useRacunV2Form } from "./hooks/useRacunV2Form";
import { AvansniLayout } from "./layouts/AvansniLayout";
import { KonacniLayout } from "./layouts/KonacniLayout";
import { PredracunLayout } from "./layouts/PredracunLayout";
import { RacunLayout } from "./layouts/RacunLayout";
import { RacunV2TabsShell } from "./RacunV2TabsShell";
import { SummaryPanel } from "./SummaryPanel";

const submitForGeneration = async (data: RacunV2Form): Promise<void> => {
  const response = await submitRacunV2ForGeneration(data);
  console.log("[RacunV2] Generation request accepted:", response);
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
        onSubmit={handleSubmit(submitForGeneration)}
        noValidate
        sx={{
          mt: 3,
          bgcolor: "grey.50",
          borderRadius: 4,
          px: { xs: 0, md: 2.5 },
          py: { xs: 0, md: 2.5 },
        }}
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
 * Dispatches the form-column content by `tipRacuna`. With Stories 6.1 / 6.2 /
 * 6.3 / 6.4 shipped, every branch of the `TipRacuna` discriminated union has
 * a dedicated layout, so the switch is exhaustive and the `_exhaustive` const
 * doubles as a TS-level guard: adding a new `TipRacuna` member without a
 * corresponding case will fail to compile here.
 */
function FormColumnForTab({ tipRacuna }: { tipRacuna: TipRacuna }) {
  switch (tipRacuna) {
    case TipRacuna.PREDRACUN:
      return <PredracunLayout />;
    case TipRacuna.AVANSNI_RACUN:
      return <AvansniLayout />;
    case TipRacuna.KONACNI_RACUN:
      return <KonacniLayout />;
    case TipRacuna.RACUN:
      return <RacunLayout />;
    default: {
      const _exhaustive: never = tipRacuna;
      return _exhaustive;
    }
  }
}
