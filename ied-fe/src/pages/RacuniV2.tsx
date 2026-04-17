import { Alert, Box } from "@mui/material";
import { TipRacuna } from "ied-shared";
import PageTitle from "../components/PageTitle";
import { useRacunV2Form } from "../components/RacunV2/hooks/useRacunV2Form";
import { RacunV2FormProvider } from "../components/RacunV2/RacunV2FormProvider";
import { RacunV2TabsShell } from "../components/RacunV2/RacunV2TabsShell";

function RacuniV2Content() {
  const { setValue, watch } = useRacunV2Form();
  const tipRacuna = watch("tipRacuna", TipRacuna.PREDRACUN);

  const handleTabChange = (nextTab: TipRacuna) => {
    setValue("tipRacuna", nextTab, { shouldDirty: true, shouldTouch: true });
  };

  return (
    <>
      <PageTitle title="Računi V2" />

      <RacunV2TabsShell currentTab={tipRacuna} onTabChange={handleTabChange} />

      <Box sx={{ mt: 3 }}>
        <Alert severity="info">
          Aktivan tab: <strong>{tipRacuna}</strong>. Forma se gradi u Epicu 2
          (react-hook-form shell).
        </Alert>
      </Box>
    </>
  );
}

export default function RacuniV2() {
  return (
    <RacunV2FormProvider>
      <RacuniV2Content />
    </RacunV2FormProvider>
  );
}
