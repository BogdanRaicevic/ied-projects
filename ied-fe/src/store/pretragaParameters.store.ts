import { FirmaQueryParams } from "@ied-shared/types/firmaQueryParams";
import { create } from "zustand";

type PretragaStore = {
  pretragaParameters: FirmaQueryParams;
  setPretragaParameters: (params: Partial<FirmaQueryParams>) => void;
  toggleNegation: (value: string) => void;
};

export const usePretragaStore = create<PretragaStore>((set) => ({
  pretragaParameters: {
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
  },
  setPretragaParameters: (params) =>
    set((state) => {
      const updatedParameters = {
        ...state.pretragaParameters,
        ...params,
      };

      // Only update the state if there is an actual change
      if (JSON.stringify(state.pretragaParameters) !== JSON.stringify(updatedParameters)) {
        return {
          pretragaParameters: updatedParameters,
        };
      }

      return state;
    }),
  // }),
  toggleNegation: (value) =>
    set((state) => {
      if (!state.pretragaParameters.negacije) {
        return {
          pretragaParameters: {
            ...state.pretragaParameters,
            negacije: [],
          },
        };
      }
      const negacije = state.pretragaParameters.negacije.includes(value)
        ? state.pretragaParameters.negacije.filter((v) => v !== value)
        : [...state.pretragaParameters.negacije, value];

      return {
        pretragaParameters: {
          ...state.pretragaParameters,
          negacije,
        },
      };
    }),
}));
