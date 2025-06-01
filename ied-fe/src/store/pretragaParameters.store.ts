import { FirmaQueryParams } from "@ied-shared/types/firmaQueryParams";
import { create } from "zustand";

type PretragaStore = {
  pretragaParameters: FirmaQueryParams;
  appliedParameters: FirmaQueryParams;
  pagination: {
    pageIndex: number;
    pageSize: number;
  };
  setPretragaParameters: (params: Partial<FirmaQueryParams>) => void;
  setPaginationParameters: (pagination: { pageIndex: number; pageSize: number }) => void;
  toggleNegation: (value: string) => void;
  applyParameters: () => void;
  loadFromStorage: () => void;
  resetParameters: () => void;
};

const localStoragePretrageParameters = 'appliedPretragaParameters'
const localStorageTablePagination = 'tablePagination';

const defaultPagination = {
  pageIndex: 0,
  pageSize: 50,
}
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
  pagination: defaultPagination,
  setPretragaParameters: (params) =>
    set((state) => ({
      pretragaParameters: {
        ...state.pretragaParameters,
        ...params,
      },
    })),
  setPaginationParameters: (pagination) =>
    set((state) => {
      const newPagination = {
        ...state.pagination,
        ...pagination,
      };
      localStorage.setItem(localStorageTablePagination, JSON.stringify(newPagination));
      return { pagination: newPagination };
    }),
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
    localStorage.setItem(localStoragePretrageParameters, JSON.stringify(pretragaParameters));
    set({ appliedParameters: pretragaParameters });
  },
  loadFromStorage: () => {
    const saved = localStorage.getItem(localStoragePretrageParameters);
    if (saved) {
      const appliedParameters = JSON.parse(saved);
      set({
        appliedParameters,
        pretragaParameters: appliedParameters
      });
    } else {
      set({ pretragaParameters: defaultParameters, appliedParameters: defaultParameters });
    }

    const savedPagination = localStorage.getItem(localStorageTablePagination);
    if (savedPagination) {
      const pagination = JSON.parse(savedPagination);
      set({ pagination });
    } else {
      set({ pagination: defaultPagination });
    }
  },
  resetParameters: () => {
    set({
      pretragaParameters: defaultParameters,
      appliedParameters: defaultParameters,
      pagination: defaultPagination,
    });
    localStorage.removeItem(localStorageTablePagination);
    localStorage.removeItem(localStoragePretrageParameters);
  },
}));
