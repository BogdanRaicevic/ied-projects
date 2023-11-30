export const fakeZaposleni = [
  {
    firma: {
      id: "nekiId1",
      naziv: "Firma 1",
      email: "firma1@fimra1.com",
      pib: "123456789",
      maticniBroj: "123456789",
      zaposleni: [
        {
          id: "zaposleni1",
          ime: "Zaposleni 1",
          prezime: "Prezime 1",
          email: "zaposleni1@firma1.com",
          radnaMesta: ["Sekretar", "Administracija"],
          komentari: "Ovo je pocetak nekog komentara",
          telefon: "123456789",
          seminari: [
            {
              id: "seminar1",
              naziv: "Seminar 1: Javne nabavke",
              datum: "2023-10-10",
              predavac: "Pera",
              osnovnaCena: 15000,
              tip: "Javne nabavke",
            },
            {
              id: "seminar3",
              naziv: "Seminar 3: Word",
              datum: "2023-11-10",
              predavac: "Zare",
              osnovnaCena: 13000,
              tip: "Word",
            },
          ],
        },
        {
          id: "zaposleni3",
          ime: "Zaposleni 3",
          prezime: "Prezime 3",
          email: "zaposleni3@firma1.com",
          radnaMesta: ["Budzet"],
          telefon: "21231221",
          seminari: [
            {
              id: "seminar1",
              naziv: "Seminar 1: Javne nabavke",
              datum: "2023-10-10",
              predavac: "Pera",
              osnovnaCena: 15000,
              tip: "Javne nabavke",
            },
          ],
        },
        {
          id: "zaposleni2",
          ime: "Zaposleni 2",
          prezime: "Prezime 2",
          email: "zaposleni2@firma1.com",
          radnaMesta: ["LPA", "NOU"],
          telefon: "",
          seminari: [
            {
              id: "seminar2",
              naziv: "Seminar 2: Excel",
              datum: "2023-12-10",
              predavac: "Jovan",
              osnovnaCena: 15000,
              tip: "Excel",
            },
          ],
        },
      ],
    },
  },
];
