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
