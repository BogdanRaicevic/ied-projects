import { create } from "zustand";

export type PretragaParametersType = {
  imeFirme: string;
  pib: string;
  email: string;
  velicineFirmi: string[];
  radnaMesta: string[];
  tipoviFirme: string[];
  delatnosti: string[];
  mesta: string[];
  negacije: string[];
};

type PretragaStore = {
  pretragaParameters: PretragaParametersType;
  setPretragaParameters: (params: Partial<PretragaParametersType>) => void;
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
