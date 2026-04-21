import { IzdavacRacuna, TipRacuna } from "../types/racuni.zod";

/**
 * Whether each izdavac is a PDV obveznik. Single source of truth for both V1 and V2.
 *
 * Phase 2 promotes this into `izdavacRacuna.const.ts` (with the rest of the
 * izdavac config: naziv, adresa, pib, maticniBroj, tekuciRacun, ...). Until
 * then, calculators and the FE form hook read from here so we don't sprinkle
 * `izdavacRacuna === IzdavacRacuna.PERMANENT` checks across the code.
 */
export const IZDAVAC_PDV_OBVEZNIK: Record<IzdavacRacuna, boolean> = {
  [IzdavacRacuna.IED]: true,
  [IzdavacRacuna.PERMANENT]: false,
  [IzdavacRacuna.BS]: true,
};

export const isIzdavacPdvObveznik = (izdavac: IzdavacRacuna): boolean =>
  IZDAVAC_PDV_OBVEZNIK[izdavac];

/**
 * Display labels for the izdavac dropdown. Used by V2 form (and future V2
 * search filters / DOCX rekapitulacija). V1 uses logos instead.
 */
export const IZDAVAC_RACUNA_LABELS: Record<IzdavacRacuna, string> = {
  [IzdavacRacuna.IED]: "IED",
  [IzdavacRacuna.PERMANENT]: "Permanent",
  [IzdavacRacuna.BS]: "BS",
};

/**
 * Single source of truth for the supported invoice currencies.
 *
 * The Zod schema (`RacunV2Zod.valuta`) builds its enum from this tuple, so
 * adding a currency in Phase 6 is a one-line change here. UI iterates over
 * this tuple to render the `<Select>` options.
 */
export const VALUTA_VALUES = ["RSD", "EUR"] as const;
export type Valuta = (typeof VALUTA_VALUES)[number];

export const VALUTA_LABELS: Record<Valuta, string> = {
  RSD: "RSD",
  EUR: "EUR",
};

/**
 * Which `tipRacuna` branches carry a `rokZaUplatu` field on their schema.
 *
 * `rokZaUplatu` is the number of days the client has to pay the invoice. It
 * lives on:
 *   - PREDRACUN — proforma; payment terms are the whole point.
 *   - KONACNI_RACUN — final invoice after avans; still has a due date.
 *   - RACUN — regular invoice; standard payment terms apply.
 *
 * Avansni racun is the exception: it doesn't have `rokZaUplatu`. Instead it
 * carries `datumUplateAvansa` (the actual date the avans was paid), which
 * is a different concept (a recorded event, not a future deadline).
 *
 * Single source of truth so the rule isn't re-encoded as scattered
 * `tipRacuna === PREDRACUN || tipRacuna === KONACNI_RACUN || ...` checks.
 * Used by:
 *   - the form-column `UsloviPlacanjaSection` mounting decision (per layout);
 *   - the Pregled read-only `RokZaUplatuRow` rendering gate.
 */
export const TIP_RACUNA_HAS_ROK_ZA_UPLATU: Record<TipRacuna, boolean> = {
  [TipRacuna.PREDRACUN]: true,
  [TipRacuna.AVANSNI_RACUN]: false,
  [TipRacuna.KONACNI_RACUN]: true,
  [TipRacuna.RACUN]: true,
};

export const tipRacunaHasRokZaUplatu = (tip: TipRacuna): boolean =>
  TIP_RACUNA_HAS_ROK_ZA_UPLATU[tip];
