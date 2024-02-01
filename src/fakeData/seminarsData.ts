export const fakeSeminarsOnFirma = [
  {
    id: "seminar1",
    naziv: "Seminar 1: Javne nabavke",
    datum: "2023-10-10",
    predavac: "Pera",
    maloprodajnaCena: 15000,
    prijavljeneFirme: [
      {
        naziv: "Firma 1",
        id: "nekiId1",
        prijavljeniZaposleni: ["Zaposleni 1", "Zaposleni 2", "Zaposleni 3"],
      },
      {
        naziv: "Firma 2",
        id: "nekiId2",
        prijavljeniZaposleni: ["Zaposleni 4", "Zaposleni 5"],
      },
    ],
  },
  {
    id: "seminar2",
    naziv: "Seminar 2: Zastita na radu",
    datum: "2023-12-10",
    predavac: "Zare",
    maloprodajnaCena: 15000,
    prijavljeneFirme: [],
  },
  {
    id: "seminar3",
    naziv: "Seminar 3: Zastita na radu",
    datum: "2024-01-10",
    predavac: "Zare",
    maloprodajnaCena: 15000,
    prijavljeneFirme: [],
  },
];

export const fakeSeminarsOnSeminar = [
  {
    id: "seminar1",
    naziv: "Seminar 1: Javne nabavke",
    datum: new Date("2023-10-10"),
    predavac: "Pera",
    tipSeminara: "Javne nabavke",
    maloprodajnaCena: 15000,
    mesto: "Beograd, Hotel Moskva",
    ucesnici: [
      {
        naziv: "Firma 1",
        id: "nekiId1",
        zaposleni: [
          {
            id: "zaposleni1",
            ime: "Zaposleni 1",
            prezime: "Zaposleni 1",
            email: "zaposleni1@emil.com",
          },
          {
            id: "zaposleni2",
            ime: "Zaposleni 2",
            prezime: "Zaposleni 2",
            email: "zaposleni2@email.com",
          },
        ],
      },
    ],
  },
  {
    id: "seminar2",
    naziv: "Seminar 2: Zastita na radu",
    tipSeminara: "Zastita na radu",
    datum: new Date("2023-12-10"),
    predavac: "Zare",
    maloprodajnaCena: 15000,
    mesto: "Novi Sad, Hotel Balkan",
    ucesnici: [
      {
        naziv: "Firma 2",
        id: "nekiId2",
        zaposleni: [
          {
            id: "zaposleni3",
            ime: "Zaposleni 3",
            prezime: "Zaposleni 3",
            email: "zaposleni3@emil.com",
          },
          {
            id: "zaposleni4",
            ime: "Zaposleni 4",
            prezime: "Zaposleni 4",
            email: "zaposleni2@email.com",
          },
          {
            id: "zaposleni5",
            ime: "Zaposleni 5",
            prezime: "Zaposleni 5",
            email: "zaposlen52@email.com",
          },
        ],
      },
      {
        naziv: "Firma 3",
        id: "nekiId3",
        zaposleni: [
          {
            id: "zaposleni6",
            ime: "Zaposleni 6",
            prezime: "Zaposleni 6",
            email: "zaposleni6@emial.com",
          },
        ],
      },
    ],
  },
];

export const tipoviSeminara = [
  "Javne nabavke",
  "Zastita na radu",
  "Zastita od pozara",
  "OHSAS",
  "ISO 9001",
  "ISO 14001",
  "ISO 45001",
  "ISO 27001",
  "ISO 22000",
  "Excel obuka",
  "Word obuka",
  "Power Point obuka",
  "Wordpress obuka",
  "Zastita zivotne sredine",
];
