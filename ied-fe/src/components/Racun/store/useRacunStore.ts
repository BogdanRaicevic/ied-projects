import { create } from "zustand";

// Helper function for updating nested properties
const updateNestedProperty = (obj: any, path: string[], value: any): any => {
  if (path.length === 0) return value;

  const [current, ...rest] = path;
  return {
    ...obj,
    [current]: rest.length === 0 ? value : updateNestedProperty(obj[current] || {}, rest, value),
  };
};

interface RacunState {
  // Core data
  racunData: Partial<any>;

  // Actions
  updateRacunData: (data: Partial<any>) => void;
  updateNestedField: (fieldPath: string, value: any) => void;
  updateCalculations: (calculations: Partial<any>) => void;
  updateField: (field: keyof any, value: any) => void;

  // Getter for complete racun data
  getCompleteRacunData: () => Partial<any>;
  reset: () => void;
}

const initialRacunData: Partial<any> = {
  seminar: {
    naziv: "",
    datum: new Date(),
    lokacija: "",
    brojUcesnikaOnline: 0,
    brojUcesnikaOffline: 0,
    onlineCena: 0,
    offlineCena: 0,
    popustOnline: 0,
    popustOffline: 0,
    jedinicaMere: "Broj učesnika",
    avansBezPdv: 0,
  },
  primalacRacuna: {
    naziv: "",
    adresa: "",
    mesto: "",
    pib: "",
    maticniBroj: "",
  },
  stopaPdv: 20,
  calculations: {
    onlineUkupnaNaknada: 0,
    offlineUkupnaNaknada: 0,
    onlinePoreskaOsnovica: 0,
    offlinePoreskaOsnovica: 0,
    pdvOnline: 0,
    pdvOffline: 0,
    ukupnaNaknada: 0,
    ukupanPdv: 0,
    avansPdv: 0,
    avans: 0,
  },
  tekuciRacun: "",
  izdavacRacuna: "ied",
  // pozivNaBroj: 0,
};

export const useRacunStore = create<RacunState>((set, get) => ({
  racunData: initialRacunData,
  izdavacRacuna: "ied",
  tekuciRacun: "",

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
}));
