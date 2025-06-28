import type { FirmaQueryParams } from "@ied-shared/types/firma.zod";
import { create } from "zustand";

type PretragaStore = {
  pretragaParameters: FirmaQueryParams;
  appliedParameters: FirmaQueryParams;
  pagination: {
    pageIndex: number;
    pageSize: number;
  };
  setPretragaParameters: (params: Partial<FirmaQueryParams>) => void;
  setPaginationParameters: (pagination: {
    pageIndex: number;
    pageSize: number;
  }) => void;
  toggleNegation: (value: string) => void;
  setAppliedParameters: () => void;
  loadFromStorage: () => void;
  resetParameters: () => void;
};

const APPLIED_PRETRAGE = "appliedPretragaParameters";
const PAGINATION_PRETRAGE = "tablePagination";

const defaultPagination = {
  pageIndex: 0,
  pageSize: 50,
};
export const defaultPretrageParameters: FirmaQueryParams = {
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
  pretragaParameters: defaultPretrageParameters,
  appliedParameters: defaultPretrageParameters,
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
      localStorage.setItem(PAGINATION_PRETRAGE, JSON.stringify(newPagination));
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
  setAppliedParameters: () => {
    const { pretragaParameters } = get();
    localStorage.setItem(APPLIED_PRETRAGE, JSON.stringify(pretragaParameters));
    set({ appliedParameters: pretragaParameters });
  },
  loadFromStorage: () => {
    const savedPretragaParameters = localStorage.getItem(APPLIED_PRETRAGE);
    if (savedPretragaParameters) {
      const appliedParameters = JSON.parse(savedPretragaParameters);
      set({
        appliedParameters,
        pretragaParameters: appliedParameters,
      });
    } else {
      set({
        pretragaParameters: defaultPretrageParameters,
        appliedParameters: defaultPretrageParameters,
      });
    }

    const savedPagination = localStorage.getItem(PAGINATION_PRETRAGE);
    if (savedPagination) {
      const pagination = JSON.parse(savedPagination);
      set({ pagination });
    } else {
      set({ pagination: defaultPagination });
    }
  },
  resetParameters: () => {
    set({
      pretragaParameters: defaultPretrageParameters,
      appliedParameters: defaultPretrageParameters,
      pagination: defaultPagination,
    });
    localStorage.removeItem(PAGINATION_PRETRAGE);
    localStorage.removeItem(APPLIED_PRETRAGE);
  },
}));
