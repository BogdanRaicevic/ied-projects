import { Stack } from "@mui/material";
import { AvansAmountsSection } from "../sections/AvansAmountsSection";
import { IzdavacRacunaSection } from "../sections/IzdavacRacunaSection";
import { PrimalacRacunaSection } from "../sections/PrimalacRacunaSection";

/**
 * Form-column layout for the avansni racun tab.
 *
 * **No `StavkeSection`.** Avansni invoices have no line items by design —
 * the schema's avansni branch declares `stavke: z.never().optional()`. The
 * single avans amount + PDV rate live directly on the invoice via
 * `AvansAmountsSection`.
 *
 * **No `UsloviPlacanjaSection`.** Avansni doesn't have `rokZaUplatu` (a
 * future deadline). It has `datumUplateAvansa` instead — the date the
 * avans was actually paid — which is part of `AvansAmountsSection`.
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
      <AvansAmountsSection />
    </Stack>
  );
}
