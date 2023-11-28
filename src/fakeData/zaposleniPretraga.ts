export const searchZaposleni = [
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
          seminari: [
            {
              sminarId: "seminar1",
              naziv: "Seminar 1: Javne nabavke",
              datum: "2023-10-10",
              predavac: "Pera",
              maloprodajnaCena: 15000,
            },
            {
              seminarId: "seminar3",
              naziv: "Seminar 3: Word",
              datum: "2023-11-10",
              predavac: "Zare",
              maloprodajnaCena: 13000,
            },
          ],
        },
        {
          id: "zaposleni3",
          ime: "Zaposleni 3",
          prezime: "Prezime 3",
          email: "zaposleni3@firma1.com",
          radnaMesta: ["Budzet"],
          seminari: [
            {
              sminarId: "seminar1",
              naziv: "Seminar 1: Javne nabavke",
              datum: "2023-10-10",
              predavac: "Pera",
              maloprodajnaCena: 15000,
            },
          ],
        },
        {
          id: "zaposleni2",
          ime: "Zaposleni 2",
          prezime: "Prezime 2",
          email: "zaposleni2@firma1.com",
          radnaMesta: ["LPA", "NOU"],
          seminari: [
            {
              sminarId: "seminar2",
              naziv: "Seminar 2: Excel",
              datum: "2023-12-10",
              predavac: "Jovan",
              maloprodajnaCena: 15000,
            },
          ],
        },
      ],
    },
  },
];
