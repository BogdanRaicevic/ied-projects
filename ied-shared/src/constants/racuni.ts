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
