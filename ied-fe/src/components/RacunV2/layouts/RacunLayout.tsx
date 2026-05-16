import { Stack } from "@mui/material";
import { IzdavacRacunaSection } from "../sections/IzdavacRacunaSection";
import { PrimalacRacunaSection } from "../sections/PrimalacRacunaSection";
import { StavkeSection } from "../sections/StavkeSection";
import { UsloviPlacanjaSection } from "../sections/UsloviPlacanjaSection";

/**
 * Form-column layout for the racun (final invoice) tab.
 *
 * Composes Izdavac → Primalac → Stavke → Uslovi plaćanja in top-to-bottom
 * reading order — same shape as `PredracunLayout` since racun and predracun
 * carry the same editable surface today.
 *
 * `UsloviPlacanjaSection` is shared with `PredracunLayout` and `KonacniLayout`
 * (any `tipRacuna` for which `tipRacunaHasRokZaUplatu()` returns true).
 *
 * **`placeno` deferred:** the schema (`RacunRacunV2Zod.placeno`) is
 * `nonNegativeNumber.optional()` and `getDefaultValues(RACUN)` already seeds
 * `placeno: 0`, so the form parses and submits cleanly without a UI for the
 * field. The `PlacenoSection` (and the corresponding `− Plaćeno` deduction
 * row in Pregled, which would reuse `DeductionRow` per the Story 6.3 footnote)
 * lands in a later epic. Until then the default of 0 means racun behaves
 * exactly like predracun in the calculator (no deduction).
 */
export function RacunLayout() {
  return (
    <Stack spacing={3}>
      <IzdavacRacunaSection />
      <PrimalacRacunaSection />
      <StavkeSection />
      <UsloviPlacanjaSection />
    </Stack>
  );
}
