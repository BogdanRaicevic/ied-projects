import { Stack } from "@mui/material";
import { AvansDatumUplateSection } from "../sections/AvansDatumUplateSection";
import { IzdavacRacunaSection } from "../sections/IzdavacRacunaSection";
import { PrimalacRacunaSection } from "../sections/PrimalacRacunaSection";
import { StavkeSection } from "../sections/StavkeSection";

/**
 * Form-column layout for the avansni racun tab.
 *
 * Avansni now mirrors the predracun structure: the user adds service/product
 * stavke, but each stavka uses reduced advance fields (avans bez PDV-a +
 * PDV rate) instead of full quantity/cena/popust inputs.
 *
 * **No `UsloviPlacanjaSection`.** Avansni doesn't have `rokZaUplatu` (a
 * future deadline). It has `datumUplateAvansa` instead — the date the avans
 * was actually paid — collected by `AvansAmountsSection`.
 *
 * **Pregled mirror.** `SummaryPanel` mirrors `datumUplateAvansa` read-only
 * under "Ukupna naknada" (gated on `tipRacuna === AVANSNI_RACUN`). Same
 * pattern as the rok-za-uplatu mirror for the other three tabs.
 */
export function AvansniLayout() {
  return (
    <Stack spacing={3}>
      <IzdavacRacunaSection />
      <PrimalacRacunaSection />
      <StavkeSection />
      <AvansDatumUplateSection />
    </Stack>
  );
}
