import { Stack } from "@mui/material";
import { IzdavacRacunaSection } from "../sections/IzdavacRacunaSection";
import { LinkedAvansniSection } from "../sections/LinkedAvansniSection";
import { PrimalacRacunaSection } from "../sections/PrimalacRacunaSection";
import { StavkeSection } from "../sections/StavkeSection";
import { UsloviPlacanjaSection } from "../sections/UsloviPlacanjaSection";

/**
 * Form-column layout for the konacni racun tab.
 *
 * Composes Izdavac → Primalac → Stavke → Povezani avansni → Uslovi
 * plaćanja. The linked-avansni section sits between content (stavke) and
 * terms (uslovi) because it's a structural reference to the avans this
 * konacni closes — closer to "what is being invoiced" than to the
 * commercial terms that follow.
 *
 * `UsloviPlacanjaSection` is shared with `PredracunLayout` and `RacunLayout`
 * (any `tipRacuna` for which `tipRacunaHasRokZaUplatu()` returns true).
 *
 * Pregled mirrors:
 *   - `rokZaUplatu` (read-only, under Ukupna naknada — same as predracun/racun)
 *   - `− Avans` deduction line between PDV and Ukupna naknada
 *     (Phase 1: always 0; Phase 3 wires real linked-avansni data)
 */
export function KonacniLayout() {
  return (
    <Stack spacing={3}>
      <IzdavacRacunaSection />
      <PrimalacRacunaSection />
      <StavkeSection />
      <LinkedAvansniSection />
      <UsloviPlacanjaSection />
    </Stack>
  );
}
