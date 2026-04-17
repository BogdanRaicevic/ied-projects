import { IzdavacRacuna, TipRacuna } from "ied-shared";

export type TipPrimaoca = "firma" | "fizicko";
export type TipStavke = "usluga" | "proizvod";
export type ValutaRacuna = "RSD" | "EUR";

export type PrimalacRacunaForm = {
  tipPrimaoca: TipPrimaoca;
  firma_id?: string;
  naziv: string;
  pib?: string;
  maticniBroj?: string;
  adresa?: string;
  mesto?: string;
  jmbg?: string;
};

export type StavkaRacunaForm = {
  tipStavke: TipStavke;
  seminar_id?: string;
  naziv: string;
  datum?: Date | null;
  lokacija?: string;
  jedinicaMere: string;
  onlineKolicina?: number;
  onlineCena?: number;
  offlineKolicina?: number;
  offlineCena?: number;
  kolicina?: number;
  cena?: number;
  popust: number;
  stopaPdv: number;
};

export type RacunV2Form = {
  tipRacuna: TipRacuna;
  izdavacRacuna: IzdavacRacuna;
  tekuciRacun: string;
  pozivNaBroj: string;
  valuta: ValutaRacuna;
  defaultStopaPdv: number;
  primalacRacuna: PrimalacRacunaForm;
  stavke?: StavkaRacunaForm[];
  rokZaUplatu?: number;
  avansBezPdv?: number;
  datumUplateAvansa?: Date | null;
  linkedPozivNaBrojevi?: string[];
  placeno?: number;
};

const getBaseDefaults = (
  tipRacuna: TipRacuna,
): Omit<RacunV2Form, "stavke"> => ({
  tipRacuna,
  izdavacRacuna: IzdavacRacuna.IED,
  tekuciRacun: "",
  pozivNaBroj: "",
  valuta: "RSD",
  defaultStopaPdv: 20,
  primalacRacuna: {
    tipPrimaoca: "firma",
    firma_id: "",
    naziv: "",
    pib: "",
    maticniBroj: "",
    adresa: "",
    mesto: "",
  },
});

export const getDefaultValues = (tipRacuna: TipRacuna): RacunV2Form => {
  const baseDefaults = getBaseDefaults(tipRacuna);

  switch (tipRacuna) {
    case TipRacuna.PREDRACUN:
      return {
        ...baseDefaults,
        stavke: [],
        rokZaUplatu: 0,
      };
    case TipRacuna.AVANSNI_RACUN:
      return {
        ...baseDefaults,
        avansBezPdv: 0,
        datumUplateAvansa: null,
      };
    case TipRacuna.KONACNI_RACUN:
      return {
        ...baseDefaults,
        stavke: [],
        linkedPozivNaBrojevi: [],
      };
    case TipRacuna.RACUN:
      return {
        ...baseDefaults,
        stavke: [],
        placeno: 0,
      };
    default:
      return {
        ...baseDefaults,
        stavke: [],
      };
  }
};
