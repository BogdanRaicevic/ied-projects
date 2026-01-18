import { faker } from "@faker-js/faker";
import { Types } from "mongoose";
import {
  Delatnost,
  type DelatnostType,
} from "../../src/models/delatnosti.model";
import type { FirmaType } from "../../src/models/firma.model";
import { Mesto, type MestoType } from "../../src/models/mesto.model";
import {
  RadnaMesta,
  type RadnaMestaType,
} from "../../src/models/radna_mesta.model";
import { Seminar, type SeminarType } from "../../src/models/seminar.model";
import {
  StanjeFirme,
  type StanjeFirmeType,
} from "../../src/models/stanje_firme.model";
import { TipFirme, type TipFirmeType } from "../../src/models/tip_firme.model";
import {
  TipSeminara,
  type TipSeminaraType,
} from "../../src/models/tip_seminara.model";
import {
  VelicineFirmi,
  type VelicineFirmiType,
} from "../../src/models/velicina_firme.model";
import type { Zaposleni } from "../../src/models/zaposleni.model";
import * as firmaService from "../../src/services/firma.service";

// Seed faker for reproducible tests
faker.seed(12345);

export const TEST_DATA_CONFIG = {
  FIRMAS_COUNT: 50,
  ZAPOSLENI_MIN: 1,
  ZAPOSLENI_MAX: 8,
  SEMINARS_COUNT: 10,
  PRIJAVE_PER_SEMINAR_MIN: 5,
  PRIJAVE_PER_SEMINAR_MAX: 20,
  MESTA: [
    "Beograd",
    "Novi Sad",
    "Niš",
    "Kragujevac",
    "Subotica",
    "Čačak",
    "Leskovac",
    "Kraljevo",
  ],
  DELATNOSTI: [
    "IT",
    "Trgovina",
    "Proizvodnja",
    "Usluge",
    "Građevinarstvo",
    "Saobraćaj",
    "Obrazovanje",
  ],
  TIP_FIRME: ["DOO", "AD", "Preduzetnik", "JP"],
  TIP_SEMINARA: ["BZR", "SKJ", "HR"],
  VELICINA_FIRME: ["mala", "mikro", "srednja", "velika"],
  STANJE_FIRME: ["aktivna", "blokada", "stecaj"],
  RADNA_MESTA: [
    "Developer",
    "Manager",
    "Designer",
    "HR",
    "Sales",
    "Support",
    "Direktor",
    "Administrator",
    "nema",
  ],
  PRISUSTVO: ["online", "offline"] as const,
  VRSTA_PRIJAVE: ["telefon", "email", "drustvene_mreze"] as const,
};

// Types for seeded data references

export type SeededData = {
  tipoviSeminara: TipSeminaraType[];
  seminari: SeminarType[];
  firme: FirmaType[];
  mesta: MestoType[];
  delatnosti: DelatnostType[];
  tipoviFirme: TipFirmeType[];
  velicineFirme: VelicineFirmiType[];
  stanjaFirme: StanjeFirmeType[];
  radnaMesta: RadnaMestaType[];
};

export async function cursorToArray<T>(cursor: any): Promise<T[]> {
  const results: T[] = [];
  for await (const item of cursor) {
    results.push(item);
  }
  return results;
}

function generateZaposleni(overrides: any = {}) {
  return {
    ime: faker.person.firstName(),
    prezime: faker.person.lastName(),
    radno_mesto: faker.helpers.arrayElement(TEST_DATA_CONFIG.RADNA_MESTA),
    telefon: faker.phone.number({ style: "human" }),
    e_mail: faker.internet.email().toLowerCase(),
    prijavljeni: faker.datatype.boolean(),
    ...overrides,
  };
}

function generateFirma(overrides: any = {}) {
  return {
    naziv_firme: faker.company.name(),
    adresa: faker.location.streetAddress(),
    PIB: faker.string.numeric(9),
    telefon: faker.phone.number({ style: "human" }),
    e_mail: faker.internet.email().toLowerCase(),
    mesto: faker.helpers.arrayElement(TEST_DATA_CONFIG.MESTA),
    tip_firme: faker.helpers.arrayElement(TEST_DATA_CONFIG.TIP_FIRME),
    delatnost: faker.helpers.arrayElement(TEST_DATA_CONFIG.DELATNOSTI),
    velicina_firme: faker.helpers.arrayElement(TEST_DATA_CONFIG.VELICINA_FIRME),
    stanje_firme: faker.helpers.arrayElement(TEST_DATA_CONFIG.STANJE_FIRME),
    prijavljeni: faker.datatype.boolean(),
    ...overrides,
  };
}

function generateSeminar(tipSeminaraId: Types.ObjectId, overrides: any = {}) {
  return {
    naziv: faker.company.catchPhrase(),
    predavac: faker.person.fullName(),
    lokacija: faker.location.city(),
    offlineCena: faker.number.int({ min: 5000, max: 50000 }),
    onlineCena: faker.number.int({ min: 3000, max: 30000 }),
    datum: faker.date.between({ from: "2024-01-01", to: "2026-12-31" }),
    detalji: faker.lorem.paragraph(),
    tipSeminara: tipSeminaraId,
    prijave: [],
    ...overrides,
  };
}

function generatePrijava(
  firma: FirmaType,
  zaposleni: Zaposleni,
): SeminarType["prijave"][0] {
  return {
    _id: new Types.ObjectId(),
    firma_id: firma._id,
    firma_naziv: firma.naziv_firme,
    firma_email: firma.e_mail || "",
    firma_telefon: firma.telefon || "",
    zaposleni_id: zaposleni._id,
    zaposleni_ime: zaposleni.ime,
    zaposleni_prezime: zaposleni.prezime,
    zaposleni_email: zaposleni.e_mail || "",
    zaposleni_telefon: zaposleni.telefon || "",
    prisustvo: faker.helpers.arrayElement(TEST_DATA_CONFIG.PRISUSTVO),
    vrsta_prijave: faker.helpers.arrayElement(TEST_DATA_CONFIG.VRSTA_PRIJAVE),
  };
}

// Comprehensive seed function that creates interconnected data
export async function seedTestDatabase(): Promise<SeededData> {
  const seededData: SeededData = {
    tipoviSeminara: [],
    seminari: [],
    firme: [],
    mesta: [],
    delatnosti: [],
    tipoviFirme: [],
    velicineFirme: [],
    stanjaFirme: [],
    radnaMesta: [],
  };

  // 0. Seed lookup tables first
  // Mesta
  const postanskiBrojevi = [
    "11000",
    "21000",
    "18000",
    "34000",
    "24000",
    "32000",
    "16000",
    "36000",
  ];
  for (let i = 0; i < TEST_DATA_CONFIG.MESTA.length; i++) {
    const mesto = await Mesto.create({
      naziv_mesto: TEST_DATA_CONFIG.MESTA[i]!,
      postanski_broj: postanskiBrojevi[i] || `${10000 + i}`,
      ID_mesto: i + 1,
    });
    seededData.mesta.push(mesto.toObject());
  }

  // Delatnosti
  for (const delatnostName of TEST_DATA_CONFIG.DELATNOSTI) {
    const delatnost = await Delatnost.create({ delatnost: delatnostName });
    seededData.delatnosti.push(delatnost.toObject());
  }

  // Tipovi Firme
  for (const tipName of TEST_DATA_CONFIG.TIP_FIRME) {
    const tip = await TipFirme.create({ tip_firme: tipName });
    seededData.tipoviFirme.push(tip.toObject());
  }

  // Velicine Firme
  for (let i = 0; i < TEST_DATA_CONFIG.VELICINA_FIRME.length; i++) {
    const velicina = await VelicineFirmi.create({
      ID_velicina_firme: i + 1,
      velicina_firme: TEST_DATA_CONFIG.VELICINA_FIRME[i]!,
    });
    seededData.velicineFirme.push(velicina.toObject());
  }

  // Stanja Firme
  for (const stanjeName of TEST_DATA_CONFIG.STANJE_FIRME) {
    const stanje = await StanjeFirme.create({ stanje_firme: stanjeName });
    seededData.stanjaFirme.push(stanje.toObject());
  }

  // Radna Mesta
  for (const radnoMestoName of TEST_DATA_CONFIG.RADNA_MESTA) {
    const radnoMesto = await RadnaMesta.create({ radno_mesto: radnoMestoName });
    seededData.radnaMesta.push(radnoMesto.toObject());
  }

  // 1. Create TipSeminara records
  for (const tipName of TEST_DATA_CONFIG.TIP_SEMINARA) {
    const tip = await TipSeminara.create({ tipSeminara: tipName });
    seededData.tipoviSeminara.push(tip.toObject());
  }

  // 2. Create Firmas with Zaposleni
  for (let i = 0; i < TEST_DATA_CONFIG.FIRMAS_COUNT; i++) {
    const firmaData = generateFirma();
    const firma = await firmaService.create(firmaData);

    // Add random number of zaposleni
    const zaposleniCount = faker.number.int({
      min: TEST_DATA_CONFIG.ZAPOSLENI_MIN,
      max: TEST_DATA_CONFIG.ZAPOSLENI_MAX,
    });

    let updatedFirma = firma;
    for (let j = 0; j < zaposleniCount; j++) {
      const zaposleniData = generateZaposleni();
      updatedFirma = (await firmaService.createZaposleni(
        firma._id.toString(),
        zaposleniData as any,
      )) as FirmaType;
    }

    seededData.firme.push(updatedFirma);
  }

  // 3. Create Seminars with random tipSeminara
  for (let i = 0; i < TEST_DATA_CONFIG.SEMINARS_COUNT; i++) {
    const randomTip = faker.helpers.arrayElement(seededData.tipoviSeminara);
    const seminarData = generateSeminar(randomTip._id);
    const seminar = await Seminar.create(seminarData);

    seededData.seminari.push(seminar.toObject());
  }

  // 4. Create Prijave - link random zaposleni from random firmas to seminars
  for (const seminar of seededData.seminari) {
    const prijaveCount = faker.number.int({
      min: TEST_DATA_CONFIG.PRIJAVE_PER_SEMINAR_MIN,
      max: TEST_DATA_CONFIG.PRIJAVE_PER_SEMINAR_MAX,
    });

    const prijave: SeminarType["prijave"] = [];

    // Select random firmas for this seminar's prijave
    const selectedFirmas = faker.helpers.arrayElements(
      seededData.firme.filter((f) => f.zaposleni && f.zaposleni.length > 0),
      Math.min(prijaveCount, seededData.firme.length),
    );

    for (const firma of selectedFirmas) {
      if (!firma.zaposleni || firma.zaposleni.length === 0) continue;

      // Select a random zaposleni from this firma
      const zaposleni = faker.helpers.arrayElement(firma.zaposleni);

      const prijava = generatePrijava(firma, zaposleni);
      prijave.push(prijava);
    }

    // Update seminar with prijave
    await Seminar.findByIdAndUpdate(seminar._id, { prijave });
  }

  // Refresh seminari data after adding prijave
  seededData.seminari = await Seminar.find({}).lean();

  return seededData;
}
