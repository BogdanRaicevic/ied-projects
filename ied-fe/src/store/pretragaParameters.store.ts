import { FirmaQueryParams } from "@ied-shared/types/firmaQueryParams";
import { create } from "zustand";

type PretragaStore = {
  pretragaParameters: FirmaQueryParams;
  appliedParameters: FirmaQueryParams;
  setPretragaParameters: (params: Partial<FirmaQueryParams>) => void;
  toggleNegation: (value: string) => void;
  applyParameters: () => void;
  loadFromStorage: () => void;
  resetParameters: () => void;
};

const STORAGE_KEY = 'appliedPretragaParameters'

const defaultParameters: FirmaQueryParams = {
  imeFirme: "",
  pib: "",
  email: "",
  velicineFirmi: [],
  radnaMesta: [],
  tipoviFirme: [],
  delatnosti: [],
  mesta: [],
  negacije: [],
  stanjaFirme: [],
  jbkjs: "",
  maticniBroj: "",
  komentar: "",
  seminari: [],
  imePrezime: "",
  emailZaposlenog: "",
};

export const usePretragaStore = create<PretragaStore>((set, get) => ({
  pretragaParameters: defaultParameters,
  appliedParameters: defaultParameters,
  setPretragaParameters: (params) =>
    set((state) => ({
      pretragaParameters: {
        ...state.pretragaParameters,
        ...params,
      },
    })),
  toggleNegation: (value) =>
    set((state) => {

      const currentNegacije = state.pretragaParameters.negacije || [];
      const negacije = currentNegacije.includes(value)
        ? currentNegacije.filter((v) => v !== value)
        : [...currentNegacije, value];

      return {
        pretragaParameters: {
          ...state.pretragaParameters,
          negacije,
        },
      };
    }),
  applyParameters: () => {
    const { pretragaParameters } = get();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pretragaParameters));
    set({ appliedParameters: pretragaParameters });
  },
  loadFromStorage: () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const appliedParameters = JSON.parse(saved);
      set({
        appliedParameters,
        pretragaParameters: appliedParameters
      });
    }
  },
  resetParameters: () => {
    set({
      pretragaParameters: defaultParameters,
      appliedParameters: defaultParameters
    });
    localStorage.removeItem(STORAGE_KEY);
  },
}));
