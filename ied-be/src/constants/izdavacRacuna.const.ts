const ied = {
  id: "ied",
  naziv: "Institut za ekonomsku diplomatiju d.o.o, 11080 Zemun, Bezanijska 30",
  kontaktTelefoni: ["011/307-76-12", "011/307-76-13"],
  pib: 103159254,
  maticniBroj: 17518313,
  brojResenjaOEvidencijiZaPDV: "/",
  tekuciRacuni: [
    "170-0030035229000-87 (UniCredit Banka)",
    "325-950060005103705 (OTP banka)",
    "265-330031003664864 (Raiffeisen banka)",
    "205-0000000227245-69 (Komercijalna banka)",
  ],
};

const permanent = {
  id: "permanent",
  naziv: "Permanent Educom, 11070 Beograd, Novi Beograd, Radoja Dakića 1/18",
  kontaktTelefoni: [],
  pib: 109282264,
  maticniBroj: 64066030,
  brojResenjaOEvidencijiZaPDV: "Oslobođeno PDV-a prema članu 33. Zakona o PDV-u",
  tekuciRacuni: ["205-0000000227245-69 (Komercijalna banka)"],
};

const bs = {
  id: "bs",
  naziv: "Balkanski savet za održivi razvoj i edukaciju, 11080 Zemun, Bezanijska 30",
  kontaktTelefoni: ["011/655-83-05", "064/821-33-22"],
  pib: 108935581,
  maticniBroj: 28170866,
  brojResenjaOEvidencijiZaPDV: "/",
  tekuciRacuni: ["325-9500600050635-47 (OTP banka)"],
};

export const izdavacRacuna = [ied, permanent, bs];
