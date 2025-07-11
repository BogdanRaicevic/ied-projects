import {
  type CalculationsRacunZod,
  IzdavacRacuna,
  type RacunZod,
  TipRacuna,
} from "@ied-shared/types/racuni.zod";
import { create } from "zustand";

const updateNestedProperty = (obj: any, path: string[], value: any): any => {
  if (path.length === 0) return value;

  const [current, ...rest] = path;
  return {
    ...obj,
    [current]:
      rest.length === 0
        ? value
        : updateNestedProperty(obj[current] || {}, rest, value),
  };
};

interface RacunState {
  racunData: RacunZod;

  // Actions
  updateRacunData: (data: RacunZod) => void;
  updateNestedField: (fieldPath: string, value: any) => void;
  updateCalculations: (calculations: CalculationsRacunZod) => void;
  updateField: <K extends keyof RacunZod>(field: K, value: RacunZod[K]) => void;

  getCompleteRacunData: () => RacunZod;
  reset: () => void;
  resetSeminarCalculationData: () => void;
}

const initialCalculations: CalculationsRacunZod = {
  onlineUkupnaNaknada: 0,
  offlineUkupnaNaknada: 0,
  onlinePoreskaOsnovica: 0,
  offlinePoreskaOsnovica: 0,
  popustOnline: 0,
  popustOffline: 0,
  pdvOnline: 0,
  pdvOffline: 0,
  ukupnaNaknada: 0,
  ukupanPdv: 0,
  avansPdv: 0,
  avans: 0,
  avansBezPdv: 0,
  placeno: 0,
};

const initialRacunData: RacunZod = {
  seminar: {
    seminar_id: "",
    naziv: "",
    datum: new Date(),
    lokacija: "",
    brojUcesnikaOnline: 0,
    brojUcesnikaOffline: 0,
    onlineCena: 0,
    offlineCena: 0,

    jedinicaMere: "Broj učesnika",
  },
  primalacRacuna: {
    firma_id: "",
    naziv: "",
    adresa: "",
    mesto: "",
    pib: "",
    maticniBroj: "",
  },
  stopaPdv: 20,
  calculations: {
    ...initialCalculations,
  },
  tekuciRacun: "",
  izdavacRacuna: IzdavacRacuna.IED,
  tipRacuna: TipRacuna.PREDRACUN,
  rokZaUplatu: 0,
  datumUplateAvansa: new Date(),
};

export const useRacunStore = create<RacunState>((set, get) => ({
  racunData: initialRacunData,

  updateRacunData: (data) =>
    set((state) => ({
      racunData: { ...state.racunData, ...data },
    })),

  updateNestedField: (fieldPath, value) =>
    set((state) => {
      const pathArray = fieldPath.split(".");
      return {
        racunData: updateNestedProperty(state.racunData, pathArray, value),
      };
    }),

  updateCalculations: (calculations) =>
    set((state) => ({
      racunData: {
        ...state.racunData,
        calculations: {
          ...state.racunData.calculations,
          ...calculations,
        },
      },
    })),

  updateField: (field, value) =>
    set((state) => ({
      racunData: { ...state.racunData, [field]: value },
    })),

  getCompleteRacunData: () => {
    const { racunData } = get();
    return {
      ...racunData,
    };
  },

  reset: () =>
    set({
      racunData: initialRacunData,
    }),

  resetSeminarCalculationData: () =>
    set((state) => ({
      racunData: {
        ...state.racunData,
        calculations: {
          ...initialCalculations,
        },
        pozivNaBroj: "",
        rokZaUplatu: 0,
        linkedPozivNaBroj: "",
        tekuciRacun: "",
        datumUplateAvansa: new Date(),
        _id: undefined,
        dateCreatedAt: undefined,
        dateUpdatedAt: undefined,
      },
    })),
}));
