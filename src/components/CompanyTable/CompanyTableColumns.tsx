import { IOptionalZaposleni } from "../../fakeData/companyData";
export const CompanyTableColumns = [
  {
    // Make an expander cell
    Header: () => null, // No header
    id: "expander", // It needs an ID,
    Cell: ({ row }) => <span {...row.getToggleRowExpandedProps()}>{row.isExpanded ? "👇" : "👉"}</span>,
  },
  {
    Header: "ID",
    accessor: "id" as const,
  },
  {
    Header: "Naziv kompanije",
    accessor: "naziv" as const,
  },
  {
    Header: "Sajt",
    accessor: "sajt" as const,
  },
  {
    Header: "Adresa",
    accessor: "adresa" as const,
  },
  {
    Header: "Grad",
    accessor: "grad" as const,
  },
  {
    Header: "Opstina",
    accessor: "opstina" as const,
  },
  {
    Header: "PIB",
    accessor: "pib" as const,
  },
  {
    Header: "Postanski broj",
    accessor: "ptt" as const,
  },
  {
    Header: "Email",
    accessor: "email" as const,
  },
  {
    Header: "Telefon",
    accessor: "telefon" as const,
  },
  {
    Header: "Tip firme",
    accessor: "tipFirme" as const,
  },
  {
    Header: "Velicina",
    accessor: "velicina" as const,
  },
  {
    Header: "Stanje",
    accessor: "stanje" as const,
  },
  {
    Header: "Odjava",
    accessor: "odjava" as const,
  },
  {
    Header: "Komentari",
    accessor: "komentari" as const,
  },
  {
    Header: "Zaposleni",
    id: "zaposleni" as const,
    accessor: (data) => {
      return data.zaposleni.map((z: IOptionalZaposleni) => {
        return JSON.stringify(z);
      });
    },
  },
];
