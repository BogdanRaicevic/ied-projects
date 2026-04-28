import { Stack } from "@mui/material";
import { IzdavacRacunaSection } from "../sections/IzdavacRacunaSection";
import { PrimalacRacunaSection } from "../sections/PrimalacRacunaSection";
import { StavkeSection } from "../sections/StavkeSection";
import { UsloviPlacanjaSection } from "../sections/UsloviPlacanjaSection";

/**
 * Form-column layout for the predracun tab.
 *
 * Composes Izdavac → Primalac → Stavke → Uslovi plaćanja in top-to-bottom
 * reading order. `Uslovi` last because it's terms after the invoice content
 * (what is being invoiced → terms of payment).
 *
 * `UsloviPlacanjaSection` is shared with the konacni & racun layouts (any
 * `tipRacuna` for which `tipRacunaHasRokZaUplatu()` returns true). The Pregled
 * panel mirrors the value read-only under "Ukupna naknada" — see the Story
 * 6.1 footnote in the plan for the rationale.
 */
export function PredracunLayout() {
  return (
    <Stack spacing={3}>
      <IzdavacRacunaSection />
      <PrimalacRacunaSection />
      <StavkeSection />
      <UsloviPlacanjaSection />
    </Stack>
  );
}
