import type {
  FirmaType,
  PrijavaZodType,
  PrimalacFirmaV2Form,
  SeminarZodType,
  StavkaUslugaV2Form,
} from "ied-shared";
import { getEmptyUslugaStavka } from "./stavkaDefaults";

/**
 * Phase 1 prefill is always for the **predracun** branch with a single usluga
 * stavka (one seminar in, one line-out — the V1 contract). Returning a strict
 * shape here (rather than `Partial<RacunV2Form>`) lets the merge in
 * `getDefaultValues` stay a flat spread and keeps types honest: callers can't
 * accidentally inject avansni-only or konacni-only fields through this path.
 */
export type RacunV2SeminariPrefill = {
  primalacRacuna: PrimalacFirmaV2Form;
  stavke: [StavkaUslugaV2Form];
};

/**
 * `defaultStopaPdv` mirrors the V2 form's own seeded default. Kept as a
 * named constant rather than a magic literal so the contract with
 * `getCommonDefaults` is explicit — if either changes, the other should too.
 */
const PREFILL_STOPA_PDV = 20;

/**
 * Builds the predracun-shaped prefill slice from Seminari navigation context.
 *
 * Mirrors V1's `Racuni.tsx` prefill effect (the bag of `updateNestedField`
 * calls), but expressed as a single pure function so it's testable, reusable,
 * and impossible to half-apply. Called once per page mount inside
 * `useRacunV2SeminariPrefill` after the firma + seminar fetches resolve.
 *
 * **Field mapping (V1 → V2):**
 * - `firma.naziv_firme` → `primalacRacuna.naziv`
 * - `firma.PIB` → `primalacRacuna.pib` (capitalization differs between models)
 * - `firma.maticni_broj` → `primalacRacuna.maticniBroj`
 * - `firma.mesto.naziv_mesto` → `primalacRacuna.mesto` (V1 stored an object,
 *   V2 stores the flat city name; matches DOCX rendering needs)
 * - `seminar.naziv` → `stavke[0].naziv`, `seminar.datum` → `stavke[0].datum`,
 *   etc.
 * - `prijave.filter(prisustvo === "online").length` → `stavke[0].onlineKolicina`
 *   (same for offline) — counts of attendees by mode, identical to V1.
 *
 * **Required-field handling:** the V2 schema marks `pib` and `maticniBroj` as
 * required, but firma data may legitimately have them blank. We prefill the
 * empty string anyway (per ticket 7.2.4: "all fields remain editable") — the
 * user fills in what's missing, and `mode: "onTouched"` (Story 8.1) keeps
 * the error from showing until they touch the field. Forcing a fallback
 * value here would silently mask data quality issues.
 */
export function buildPrefillFromSeminari({
  firma,
  seminar,
  prijave,
}: {
  firma: FirmaType;
  seminar: SeminarZodType;
  prijave: PrijavaZodType[];
}): RacunV2SeminariPrefill {
  const onlineKolicina = prijave.filter(
    (prijava) => prijava.prisustvo === "online",
  ).length;
  const offlineKolicina = prijave.filter(
    (prijava) => prijava.prisustvo === "offline",
  ).length;

  const primalacRacuna: PrimalacFirmaV2Form = {
    tipPrimaoca: "firma",
    firma_id: firma._id ?? "",
    naziv: firma.naziv_firme ?? "",
    pib: firma.PIB ?? "",
    maticniBroj: firma.maticni_broj ?? "",
    adresa: firma.adresa ?? "",
    mesto: firma.mesto?.naziv_mesto ?? "",
  };

  const baseStavka = getEmptyUslugaStavka(PREFILL_STOPA_PDV);
  const stavka: StavkaUslugaV2Form = {
    ...baseStavka,
    seminar_id: seminar._id ?? "",
    naziv: seminar.naziv,
    datum: seminar.datum,
    lokacija: seminar.lokacija ?? "",
    onlineKolicina,
    onlineCena: seminar.onlineCena ?? 0,
    offlineKolicina,
    offlineCena: seminar.offlineCena ?? 0,
  };

  return {
    primalacRacuna,
    stavke: [stavka],
  };
}
