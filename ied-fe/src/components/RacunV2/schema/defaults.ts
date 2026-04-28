import { IzdavacRacuna, type RacunV2Form, TipRacuna } from "ied-shared";
import type { RacunV2SeminariPrefill } from "./buildPrefillFromSeminari";

const getCommonDefaults = () => ({
  izdavacRacuna: IzdavacRacuna.IED,
  tekuciRacun: "",
  pozivNaBroj: "",
  valuta: "RSD" as const,
  defaultStopaPdv: 20,
  primalacRacuna: {
    tipPrimaoca: "firma" as const,
    firma_id: "",
    naziv: "",
    pib: "",
    maticniBroj: "",
    adresa: "",
    mesto: "",
  },
});

/**
 * Optional Seminari-prefill slice merged in by the form provider when the
 * page is reached via the "Kreiraj V2 račun" button on `PrijaveSeminarTable`
 * (Story 7.2). Forced to the predracun branch — that's the only `tipRacuna`
 * the prefill shape can satisfy, and it matches V1's parity (Seminari → blank
 * predracun with primalac + first usluga stavka prefilled).
 *
 * The merge is intentionally a flat spread: the prefill builder
 * (`buildPrefillFromSeminari`) returns COMPLETE objects for `primalacRacuna`
 * and `stavke[0]`, so a deep merge would only re-do work the builder already
 * did and risk subtle override-direction bugs (which side wins on a per-leaf
 * basis).
 */
export const getDefaultValues = (
  tipRacuna: TipRacuna,
  prefill?: RacunV2SeminariPrefill,
): RacunV2Form => {
  const commonDefaults = getCommonDefaults();

  if (prefill) {
    return {
      ...commonDefaults,
      tipRacuna: TipRacuna.PREDRACUN,
      stavke: prefill.stavke,
      rokZaUplatu: null,
      primalacRacuna: prefill.primalacRacuna,
    };
  }

  switch (tipRacuna) {
    case TipRacuna.PREDRACUN:
      return {
        ...commonDefaults,
        tipRacuna: TipRacuna.PREDRACUN,
        stavke: [],
        rokZaUplatu: null,
      };
    case TipRacuna.AVANSNI_RACUN:
      return {
        ...commonDefaults,
        tipRacuna: TipRacuna.AVANSNI_RACUN,
        avansBezPdv: 0,
        stopaPdvAvansni: 20,
        datumUplateAvansa: null,
      };
    case TipRacuna.KONACNI_RACUN:
      return {
        ...commonDefaults,
        tipRacuna: TipRacuna.KONACNI_RACUN,
        stavke: [],
        // Schema requires non-empty; blank seed lets the user start with a
        // visible "obavezan" error in Pregled rather than a silent failure
        // on first submit.
        linkedPozivNaBroj: "",
        rokZaUplatu: null,
      };
    case TipRacuna.RACUN:
      return {
        ...commonDefaults,
        tipRacuna: TipRacuna.RACUN,
        stavke: [],
        placeno: 0,
        rokZaUplatu: null,
      };
    default:
      return {
        ...commonDefaults,
        tipRacuna: TipRacuna.PREDRACUN,
        stavke: [],
        rokZaUplatu: null,
      };
  }
};
