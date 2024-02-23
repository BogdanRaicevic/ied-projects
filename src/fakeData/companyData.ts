import { Company, Zaposleni } from "../schemas/companySchemas";

export const companiesData: Company[] = [
  {
    id: "1",
    zeleMarketingMaterijal: true,
    sajt: "asdf.com",
    naziv: "Prva",
    adresa: "neka adresa 1",
    grad: "Beograd",
    opstina: "Novi Beograd",
    pib: "123412341",
    ptt: "11070",
    telefon: "011234234",
    email: "asdf@asdf.com",
    tip: "doo",
    velicina: "velika",
    stanje: "likvidna",
    odjava: false,
    komentari: "11.11.2022",
    lastTouched: new Date().toISOString(),
    zaposleni: [
      {
        id: "1",
        firmaId: "1",
        ime: "ime 1",
        prezime: "prezime 1",
        email: "e1@asdf.com",
        telefon: "12341234",
        zeleMarketingMaterijal: true,
        brojSertifikata: "123",
        komentari: `Lorem Ipsum is simply dummy text of the printing and typesetting industry.
        Lorem Ipsum has been the industry's standard dummy text ever since the
        1500s, when an unknown printer took a galley of type and scrambled it to
        make a type specimen book. It has survived not only five centuries, but
        also the leap into electronic typesetting, remaining essentially
        unchanged. It was popularised in the 1960s with the release of Letraset
        sheets containing Lorem Ipsum passages, and more recently with desktop
        publishing software like Aldus PageMaker including versions of Lorem
        Ipsum. Why do we use it? It is a long established fact that a reader will
        be distracted by the readable content of a page when looking at its
        layout. The point of using Lorem Ipsum is that it has a more-or-less
        normal distribution of letters, as opposed to using 'Content here, content
        here', making it look like readable English. Many desktop publishing
        packages and web page editors now use Lorem Ipsum as their default model
        text, and a search for 'lorem ipsum' will uncover many web sites still in
        their infancy. Various versions have evolved over the years, sometimes by
        accident, sometimes on purpose (injected humour and the like). Where does
        it come from? Contrary to popular belief, Lorem Ipsum is not simply random
        text. It has roots in a piece of classical Latin literature from 45 BC,
        making it over 2000 years old. Richard McClintock, a Latin professor at
        Hampden-Sydney College in Virginia, looked up one of the more obscure
        Latin words, consectetur, from a Lorem Ipsum passage, and going through
        the cites of the word in classical literature, discovered the undoubtable
        source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus
        Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written in
        45 BC. This book is a treatise on the theory of ethics, very popular
        during the Renaissance. The first line of Lorem Ipsum, "Lorem ipsum dolor
        sit amet..", comes from a line in section 1.10.32. The standard chunk of
        Lorem Ipsum used since the 1500s is reproduced below for those interested.
        Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by
        Cicero are also reproduced in their exact original form, accompanied by
        English versions from the 1914 translation by H. Rackham. Where can I get
        some? There are many variations of passages of Lorem Ipsum available, but
        the majority have suffered alteration in some form, by injected humour, or
        randomised words which don't look even slightly believable. If you are
        going to use a passage of Lorem Ipsum, you need to be sure there isn't
        anything embarrassing hidden in the middle of text. All the Lorem Ipsum
        generators on the Internet tend to repeat predefined chunks as necessary,
        making this the first true generator on the Internet. It uses a dictionary
        of over 200 Latin words, combined with a handful of model sentence
        structures, to generate Lorem Ipsum which looks reasonable. The generated
        Lorem Ipsum is therefore always free from repetition, injected humour, or
        non-characteristic words etc.`,
        radnaMesta: ["Sekretar", "LPA"],
      },
      {
        id: "5",
        firmaId: "1",
        ime: "ime 5",
        prezime: "prezime 5",
        email: "e2@asdf.com",
        telefon: "12341234",
        zeleMarketingMaterijal: false,
        brojSertifikata: "123",
        komentari: "komentar 12",
        radnaMesta: ["Sekretar", "LPA"],
      },
    ],
    seminari: [
      {
        naziv: "Seminar 1",
        datum: "2021-10-10",
        ucesnici: ["Pera", "Mika", "Zika"],
      },
    ],
  },
  {
    id: "2",
    zeleMarketingMaterijal: false,
    sajt: "",
    naziv: "Druga",
    adresa: "neka adresa 2",
    grad: "Sabac",
    opstina: "",
    pib: "222222222",
    ptt: "22010",
    telefon: "011234234",
    email: "asdf@bbbb.com",
    tip: "preduzetnik",
    velicina: "srednja",
    stanje: "stecaj",
    odjava: true,
    komentari: "11.11.2022",
    lastTouched: new Date().toISOString(),
    zaposleni: [],
    seminari: [
      {
        naziv: "Seminar 1",
        datum: "2021-10-10",
        ucesnici: ["Pera", "Mika", "Zika"],
      },
      {
        naziv: "Seminar 2",
        datum: "2023-10-10",
        ucesnici: ["Joca", "Mika", "Boca"],
      },
      {
        naziv: "Seminar 3",
        datum: "2020-11-10",
        ucesnici: ["Joca"],
      },
    ],
  },
  {
    sajt: "cccc.com",
    zeleMarketingMaterijal: false,
    id: "3",
    naziv: "Treca",
    adresa: "neka adresa 3",
    grad: "Pancevo",
    opstina: "",
    pib: "3333333",
    ptt: "33033",
    telefon: "011234234",
    email: "asdf@cccc.com",
    tip: "budzet",
    velicina: "velika",
    stanje: "likvidna",
    odjava: false,
    komentari: "11.11.2022",
    lastTouched: new Date().toISOString(),
    zaposleni: [
      {
        id: "2",
        firmaId: "3",
        ime: "ime 2",
        prezime: "prezime 2",
        email: "e1@cccc.com",
        telefon: "12341234",
        zeleMarketingMaterijal: false,
        brojSertifikata: "123",
        komentari: "komentar 1",
        radnaMesta: ["Sekretar", "LPA"],
      },
    ],
    seminari: [
      {
        naziv: "Seminar 1",
        datum: "2021-10-10",
        ucesnici: ["Pera", "Mika", "Zika"],
      },
      {
        naziv: "Seminar 2",
        datum: "2023-10-10",
        ucesnici: ["Joca", "Mika", "Boca"],
      },
      {
        naziv: "Seminar 3",
        datum: "2020-11-10",
        ucesnici: ["Joca"],
      },
    ],
  },
  {
    sajt: "",
    id: "4",
    zeleMarketingMaterijal: true,
    naziv: "cetvrta",
    adresa: "neka adresa 3",
    grad: "Nis",
    opstina: "",
    pib: "4444444",
    ptt: "44044",
    telefon: "011234234",
    email: "asdf@dddd.com",
    tip: "Akcionarsko drustvo",
    velicina: "mala",
    stanje: "blokada",
    odjava: false,
    komentari: "11.11.2022",
    lastTouched: new Date().toISOString(),
    zaposleni: [
      {
        id: "4",
        firmaId: "4",
        ime: "ime 4",
        prezime: "prezime 4",
        email: "e1@dddd.com",
        telefon: "12341234",
        zeleMarketingMaterijal: true,
        brojSertifikata: "123",
        komentari: "komentar 1",
        radnaMesta: ["Sekretar", "LPA"],
      },
    ],
    seminari: [
      {
        naziv: "Seminar 1",
        datum: "2021-10-10",
        ucesnici: ["Pera", "Mika", "Zika"],
      },
      {
        naziv: "Seminar 2",
        datum: "2023-10-10",
        ucesnici: ["Joca", "Mika", "Boca"],
      },
      {
        naziv: "Seminar 3",
        datum: "2020-11-10",
        ucesnici: ["Joca"],
      },
    ],
  },
  {
    sajt: "gggg.com",
    id: "5",
    zeleMarketingMaterijal: true,
    naziv: "Peta",
    adresa: "neka adresa 5",
    grad: "Novi Sad",
    opstina: "",
    pib: "5555555",
    ptt: "55055",
    telefon: "011234234",
    email: "asdf@gggg.com",
    tip: "doo",
    velicina: "velika",
    stanje: "likvidna",
    odjava: true,
    komentari: "11.11.2022",
    lastTouched: new Date().toISOString(),
    zaposleni: [
      {
        id: "3",
        firmaId: "4",
        ime: "ime 3",
        prezime: "prezime 3",
        email: "e1@gggg.com",
        telefon: "12341234",
        zeleMarketingMaterijal: false,
        brojSertifikata: "123",
        komentari: "komentar 1",
        radnaMesta: ["Sekretar", "LPA"],
      },
    ],
    seminari: [
      {
        naziv: "Seminar 1",
        datum: "2021-10-10",
        ucesnici: ["Pera", "Mika", "Zika"],
      },
      {
        naziv: "Seminar 2",
        datum: "2023-10-10",
        ucesnici: ["Joca", "Mika", "Boca"],
      },
      {
        naziv: "Seminar 3",
        datum: "2020-11-10",
        ucesnici: ["Joca"],
      },
    ],
  },
];

export const zaposleniData: Zaposleni[] = [
  {
    id: "1",
    firmaId: "1",
    ime: "ime 1",
    prezime: "prezime 1",
    email: "e1@asdf.com",
    telefon: "12341234",
    zeleMarketingMaterijal: true,
    brojSertifikata: "123",
    komentari: `Lorem Ipsum is simply dummy text of the printing and typesetting industry.
    Lorem Ipsum has been the industry's standard dummy text ever since the
    1500s, when an unknown printer took a galley of type and scrambled it to
    make a type specimen book. It has survived not only five centuries, but
    also the leap into electronic typesetting, remaining essentially
    unchanged. It was popularised in the 1960s with the release of Letraset
    sheets containing Lorem Ipsum passages, and more recently with desktop
    publishing software like Aldus PageMaker including versions of Lorem
    Ipsum. Why do we use it? It is a long established fact that a reader will
    be distracted by the readable content of a page when looking at its
    layout. The point of using Lorem Ipsum is that it has a more-or-less
    normal distribution of letters, as opposed to using 'Content here, content
    here', making it look like readable English. Many desktop publishing
    packages and web page editors now use Lorem Ipsum as their default model
    text, and a search for 'lorem ipsum' will uncover many web sites still in
    their infancy. Various versions have evolved over the years, sometimes by
    accident, sometimes on purpose (injected humour and the like). Where does
    it come from? Contrary to popular belief, Lorem Ipsum is not simply random
    text. It has roots in a piece of classical Latin literature from 45 BC,
    making it over 2000 years old. Richard McClintock, a Latin professor at
    Hampden-Sydney College in Virginia, looked up one of the more obscure
    Latin words, consectetur, from a Lorem Ipsum passage, and going through
    the cites of the word in classical literature, discovered the undoubtable
    source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus
    Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written in
    45 BC. This book is a treatise on the theory of ethics, very popular
    during the Renaissance. The first line of Lorem Ipsum, "Lorem ipsum dolor
    sit amet..", comes from a line in section 1.10.32. The standard chunk of
    Lorem Ipsum used since the 1500s is reproduced below for those interested.
    Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by
    Cicero are also reproduced in their exact original form, accompanied by
    English versions from the 1914 translation by H. Rackham. Where can I get
    some? There are many variations of passages of Lorem Ipsum available, but
    the majority have suffered alteration in some form, by injected humour, or
    randomised words which don't look even slightly believable. If you are
    going to use a passage of Lorem Ipsum, you need to be sure there isn't
    anything embarrassing hidden in the middle of text. All the Lorem Ipsum
    generators on the Internet tend to repeat predefined chunks as necessary,
    making this the first true generator on the Internet. It uses a dictionary
    of over 200 Latin words, combined with a handful of model sentence
    structures, to generate Lorem Ipsum which looks reasonable. The generated
    Lorem Ipsum is therefore always free from repetition, injected humour, or
    non-characteristic words etc.`,
    radnaMesta: ["Sekretar", "LPA"],
  },
  {
    id: "2",
    firmaId: "3",
    ime: "ime 2",
    prezime: "prezime 2",
    email: "e1@cccc.com",
    telefon: "12341234",
    zeleMarketingMaterijal: true,
    brojSertifikata: "123",
    komentari: "komentar 1",
    radnaMesta: ["Sekretar", "LPA"],
  },
  {
    id: "3",
    firmaId: "4",
    ime: "ime 3",
    prezime: "prezime 3",
    email: "e1@gggg.com",
    telefon: "12341234",
    zeleMarketingMaterijal: false,
    brojSertifikata: "123",
    komentari: "komentar 1",
    radnaMesta: ["Sekretar", "LPA"],
  },
  {
    id: "4",
    firmaId: "4",
    ime: "ime 4",
    prezime: "prezime 4",
    email: "e1@dddd.com",
    telefon: "12341234",
    zeleMarketingMaterijal: false,
    brojSertifikata: "123",
    komentari: "komentar 1",
    radnaMesta: ["Sekretar", "LPA"],
  },
  {
    id: "5",
    firmaId: "1",
    ime: "ime 5",
    prezime: "prezime 5",
    email: "e2@asdf.com",
    telefon: "12341234",
    zeleMarketingMaterijal: true,
    brojSertifikata: "123",
    komentari: "komentar 11",
    radnaMesta: ["Sekretar", "LPA"],
  },
];

export const velicineFirme = ["mala", "srednja", "velika", "ne znam"];
export const stanjaFirme = ["likvidna", "u blokadi", "bankrot", "ne znam"];
export const tipoviFirme = ["doo", "preduzetnik", "akcionarsko drustvo", "budzet", "ne znam"];

export const fakeRadnaMesta = [
  { parent: "Sva radna mesta" },
  { parent: "Administracija" },
  { parent: "Budzet", children: ["LPA", "NBF", "NOU", "Sekretar"] },
];

export const normalizedRadnaMesta = [
  "Sva radna mesta",
  "Administracija",
  "Budzet",
  "LPA",
  "NBF",
  "NOU",
  "Sekretar",
];
