import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
(<any>pdfMake).vfs = pdfFonts.pdfMake.vfs;

const documentDefinition: any = {
  content: [
    {
      style: "myExample",
      table: {
        body: [
          [{ text: "Ovde naziv izdavaoca racuna", bold: true }],
          ["adresa izdavaca racuna - 11080 Beograd - Zemun"],
          ["telefon: +381 011 123123 - email: asdf@email.com"],
          ["PIB: 123123123 - Maticni Broj: 123123123"],
          [{ text: "Tekuci racun: 123-12313123123-12 - Raifaisen banka", bold: true }],
        ],
      },
      layout: "lightHorizontalLines",
    },
    {
      margin: [0, 32, 0, 0],
      table: {
        body: [
          [{ text: "Primalac racuna", bold: true }],
          ["Naziv firme, odnosno primaoca racuna"],
          ["Ovde adresa firme"],
          ["PIB: 8181818181"],
          ["Maticni broj: 8181818181"],
        ],
      },
      layout: "lightHorizontalLines",
    },
    {
      text: "Predracun broj: 003/23",
      margin: [0, 32, 0, 0],
      style: "predracun",
      alignment: "center",
    },
    {
      margin: [0, 32, 0, 0],
      table: {
        body: [
          [
            "R.br",
            "Vrsta usluge",
            "Jedinica mere",
            "Kolicina",
            "Cena po jedinici",
            "Popust",
            "Poreska osnovica",
            "Stopa PDV",
            "PDV",
            "Ukupna naknada",
          ],
          [
            "1",
            "Neki seminar veliki seminar",
            "broj ucesnika",
            "1",
            "12.500",
            "10%",
            "11.250",
            "20%",
            "2.250",
            "13.500",
          ],
        ],
      },
    },
    {
      text: "Uplatu izvrsiti na racun: 123-1231231233-12",
      margin: [0, 32, 0, 0],
      alignment: "center",
      bold: true,
    },
    {
      text: "Rok za uplatu 16.1.2023",
      alignment: "center",
      bold: true,
    },
    {
      margin: [0, 32, 0, 0],
      text: "M.P.                 _____________________________________",
      alignment: "right",
    },
    {
      margin: [0, 32, 0, 0],
      text: "Mesto i datum izdavanja Predracuna: Zemun 10.1.2023",
    },
    {
      margin: [0, 32, 0, 0],
      text: "Ovaj dokument je izradjen u elektronskoj formi i vazi bez pecata i potpisa",
      alignment: "center",
    },
  ],
  styles: {
    predracun: {
      fontSize: 18,
      bold: true,
      alignment: "justify",
    },
  },
};

export const createPdf = () => {
  const pdfGenerator = pdfMake.createPdf(documentDefinition);
  pdfGenerator.download();
};
