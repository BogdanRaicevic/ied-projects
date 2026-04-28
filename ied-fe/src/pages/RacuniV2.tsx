import { Alert, Box, CircularProgress, Stack, Typography } from "@mui/material";
import { useRacunV2SeminariPrefill } from "../components/RacunV2/hooks/useRacunV2SeminariPrefill";
import { RacunV2Content } from "../components/RacunV2/RacunV2Content";
import { RacunV2FormProvider } from "../components/RacunV2/RacunV2FormProvider";

/**
 * Page entry for `/racuni-v2`.
 *
 * Two flows land here today:
 *
 * 1. **Direct entry** (Story 7.1): no nav state — `useRacunV2SeminariPrefill`
 *    returns `status: "ready"` immediately, the form mounts blank on the
 *    predracun tab via `RacunV2FormProvider`'s built-in defaults.
 * 2. **From Seminari** (Story 7.2): nav state contains `{ seminarId, prijave }`
 *    written by `PrijaveSeminarTable`'s "Kreiraj V2 račun" button. The hook
 *    fetches firma + seminar in parallel, builds the prefill slice, and the
 *    page mounts the provider with that slice baked into `defaultValues`.
 *
 * **Why we wait to mount the provider until status === "ready":** RHF's
 * `defaultValues` are read once on mount. Mounting blank and then `reset()`-ing
 * with the loaded data would (a) flash the empty form and (b) require careful
 * dirty-state handling to avoid clobbering user input if they started typing
 * mid-fetch. Gating the mount on the prefill resolution sidesteps both
 * problems with no extra state machinery in the form layer.
 *
 * **Error degradation:** if the firma/seminar fetch fails, the hook still
 * resolves to `"ready"` with no prefill and an `errorMessage`. The form mounts
 * blank with a non-blocking warning Alert above it, so the user can fall back
 * to manual entry rather than being trapped on a dead page (V1 has the same
 * behavior — also surfaces an Alert and proceeds with whatever data loaded).
 */
export default function RacuniV2() {
  const { status, prefill, errorMessage } = useRacunV2SeminariPrefill();

  if (status === "loading") {
    return <PrefillLoadingPlaceholder />;
  }

  return (
    <Stack spacing={2}>
      {errorMessage ? <Alert severity="warning">{errorMessage}</Alert> : null}
      <RacunV2FormProvider initialPrefill={prefill}>
        <RacunV2Content />
      </RacunV2FormProvider>
    </Stack>
  );
}

function PrefillLoadingPlaceholder() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        minHeight: "40vh",
      }}
    >
      <CircularProgress />
      <Typography variant="body2" color="text.secondary">
        Ucitavanje podataka iz Seminara...
      </Typography>
    </Box>
  );
}
