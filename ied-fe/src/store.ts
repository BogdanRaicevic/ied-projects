// import { create } from "zustand";

// import { Company } from "./schemas/companySchemas";

// type CompanyState = {
//   companiesData: Company[];
//   updateCompany: (id: string, newCompanyData: Company) => void;
//   deleteCompany: (id: string) => void;
// };

// export const useCompanyStore = create<CompanyState>((set) => ({
//   companiesData: companiesData,
//   updateCompany: (id, newCompanyData) => {
//     set((state) => {
//       return {
//         companiesData: state.companiesData.map((company) =>
//           company.id === id ? newCompanyData : company
//         ),
//       };
//     });
//   },
//   deleteCompany: (id) => {
//     set((state) => {
//       return {
//         companiesData: state.companiesData.filter((c) => c.id !== id),
//       };
//     });
//   },
// }));
