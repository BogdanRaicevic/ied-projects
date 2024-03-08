import {create} from 'zustand';

import { companiesData } from './fakeData/companyData';
import { Company } from './schemas/companySchemas';

type CompanyState = {
  companiesData: Company[];
  updateCompaniesData: (newData: Company[]) => void;
};

export const useCompanyStore = create<CompanyState>((set) => ({
  companiesData: companiesData,
  updateCompaniesData: (newData) => set({ companiesData: newData }),
}));
