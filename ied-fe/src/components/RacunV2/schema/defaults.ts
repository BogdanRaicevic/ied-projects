import { IzdavacRacuna, type RacunV2Form, TipRacuna } from "ied-shared";

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

export const getDefaultValues = (tipRacuna: TipRacuna): RacunV2Form => {
  const commonDefaults = getCommonDefaults();

  switch (tipRacuna) {
    case TipRacuna.PREDRACUN:
      return {
        ...commonDefaults,
        tipRacuna: TipRacuna.PREDRACUN,
        stavke: [],
        rokZaUplatu: 0,
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
        rokZaUplatu: 0,
      };
    case TipRacuna.RACUN:
      return {
        ...commonDefaults,
        tipRacuna: TipRacuna.RACUN,
        stavke: [],
        placeno: 0,
        rokZaUplatu: 0,
      };
    default:
      return {
        ...commonDefaults,
        tipRacuna: TipRacuna.PREDRACUN,
        stavke: [],
      };
  }
};
