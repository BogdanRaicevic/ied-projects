export interface ICompanyData {
  id: number; // this will be the old id
  sajt: string;
  naziv: string;
  adresa: string;
  grad: string;
  opstina: string;
  pib: number;
  ptt: number;
  telefon: string;
  email: string;
  tipFirme: string;
  velicina: string;
  stanje: string;
  odjava: boolean;
  komentari: string;
  lastTouched: Date;
  zaposleni: IOptionalZaposleni[];
}

export interface IOptionalCompanyData extends Partial<ICompanyData> {}

export const companiesData: IOptionalCompanyData[] = [
  {
    id: 1,
    sajt: "asdf.com",
    naziv: "Prva",
    adresa: "neka adresa 1",
    grad: "Beograd",
    opstina: "Novi Beograd",
    pib: 123412341,
    ptt: 11070,
    telefon: "011234234",
    email: "asdf@asdf.com",
    tipFirme: "doo",
    velicina: "velika",
    stanje: "likvidna",
    odjava: false,
    komentari: "11.11.2022",
    lastTouched: new Date(),
    zaposleni: [
      {
        id: 1,
        firmaId: 1,
        ime: "ime 1",
        prezime: "prezime 1",
        email: "e1@asdf.com",
        telefon: "12341234",
      },
      {
        id: 5,
        firmaId: 1,
        ime: "ime 5",
        prezime: "prezime 5",
        email: "e2@asdf.com",
        telefon: "12341234",
      },
    ],
  },
  {
    sajt: "",
    id: 2,
    naziv: "Druga",
    adresa: "neka adresa 2",
    grad: "Sabac",
    opstina: "",
    pib: 222222222,
    ptt: 22010,
    telefon: "011234234",
    email: "asdf@bbbb.com",
    tipFirme: "preduzetnik",
    velicina: "srednja",
    stanje: "stecaj",
    odjava: true,
    komentari: "11.11.2022",
    lastTouched: new Date(),
    zaposleni: [],
  },
  {
    sajt: "cccc.com",
    id: 3,
    naziv: "Treca",
    adresa: "neka adresa 3",
    grad: "Pancevo",
    opstina: "",
    pib: 3333333,
    ptt: 33033,
    telefon: "011234234",
    email: "asdf@cccc.com",
    tipFirme: "budzet",
    velicina: "velika",
    stanje: "likvidna",
    odjava: false,
    komentari: "11.11.2022",
    lastTouched: new Date(),
    zaposleni: [
      {
        id: 2,
        firmaId: 3,
        ime: "ime 2",
        prezime: "prezime 2",
        email: "e1@cccc.com",
        telefon: "12341234",
      },
    ],
  },
  {
    sajt: "",
    id: 4,
    naziv: "cetvrta",
    adresa: "neka adresa 3",
    grad: "Nis",
    opstina: "",
    pib: 4444444,
    ptt: 44044,
    telefon: "011234234",
    email: "asdf@dddd.com",
    tipFirme: "Akcionarsko drustvo",
    velicina: "mala",
    stanje: "blokada",
    odjava: false,
    komentari: "11.11.2022",
    lastTouched: new Date(),
    zaposleni: [
      {
        id: 4,
        firmaId: 4,
        ime: "ime 4",
        prezime: "prezime 4",
        email: "e1@dddd.com",
        telefon: "12341234",
      },
    ],
  },
  {
    sajt: "gggg.com",
    id: 5,
    naziv: "Peta",
    adresa: "neka adresa 5",
    grad: "Novi Sad",
    opstina: "",
    pib: 5555555,
    ptt: 55055,
    telefon: "011234234",
    email: "asdf@gggg.com",
    tipFirme: "doo",
    velicina: "velika",
    stanje: "likvidna",
    odjava: true,
    komentari: "11.11.2022",
    lastTouched: new Date(),
    zaposleni: [
      {
        id: 3,
        firmaId: 4,
        ime: "ime 3",
        prezime: "prezime 3",
        email: "e1@gggg.com",
        telefon: "12341234",
      },
    ],
  },
];

export interface IZaposleni {
  id: number;
  firmaId: number;
  ime: string;
  prezime: string;
  email: string;
  telefon: string;
}

export interface IOptionalZaposleni extends Partial<IZaposleni> {}

export const zaposleniData = [
  {
    id: 1,
    firmaId: 1,
    ime: "ime 1",
    prezime: "prezime 1",
    email: "e1@asdf.com",
    telefon: "12341234",
  },
  {
    id: 2,
    firmaId: 3,
    ime: "ime 2",
    prezime: "prezime 2",
    email: "e1@cccc.com",
    telefon: "12341234",
  },
  {
    id: 3,
    firmaId: 4,
    ime: "ime 3",
    prezime: "prezime 3",
    email: "e1@gggg.com",
    telefon: "12341234",
  },
  {
    id: 4,
    firmaId: 4,
    ime: "ime 4",
    prezime: "prezime 4",
    email: "e1@dddd.com",
    telefon: "12341234",
  },
  {
    id: 5,
    firmaId: 1,
    ime: "ime 5",
    prezime: "prezime 5",
    email: "e2@asdf.com",
    telefon: "12341234",
  },
];

export const velicineFirme = ["mala", "srednja", "velika", "ne znam"];
export const stanjaFirme = ["likvidna", "u blokadi", "bankrot", "ne znam"];
export const tipoviFirme = ["doo", "preduzetnik", "akcionarsko drustvo", "ne znam"];
