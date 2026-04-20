import { IzdavacRacuna } from "../types/racuni.zod";

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
