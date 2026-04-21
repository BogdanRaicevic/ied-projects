import { z } from "zod";
import { VALUTA_VALUES } from "../constants/racuni";
import { IzdavacRacuna, TipRacuna } from "./racuni.zod";

const nonNegativeNumber = z.coerce.number().min(0, "Vrednost mora biti >= 0");
const percentage = z.coerce
  .number()
  .min(0, "Popust mora biti između 0 i 100")
  .max(100, "Popust mora biti između 0 i 100");

export const StavkaUslugaV2Zod = z.object({
  tipStavke: z.literal("usluga"),
  seminar_id: z.string().optional(),
  naziv: z.string().min(1, "Naziv usluge je obavezan"),
  datum: z.coerce.date(),
  lokacija: z.string().optional(),
  jedinicaMere: z.string().min(1).default("Broj ucesnika"),
  onlineKolicina: nonNegativeNumber.default(0),
  onlineCena: nonNegativeNumber.default(0),
  offlineKolicina: nonNegativeNumber.default(0),
  offlineCena: nonNegativeNumber.default(0),
  popust: percentage.default(0),
  stopaPdv: nonNegativeNumber.default(20),
});

export const StavkaProizvodV2Zod = z.object({
  tipStavke: z.literal("proizvod"),
  naziv: z.string().min(1, "Naziv proizvoda je obavezan"),
  jedinicaMere: z.string().min(1).default("Broj primeraka"),
  kolicina: nonNegativeNumber.default(0),
  cena: nonNegativeNumber.default(0),
  popust: percentage.default(0),
  stopaPdv: nonNegativeNumber.default(20),
});

export const StavkaV2Zod = z.discriminatedUnion("tipStavke", [
  StavkaUslugaV2Zod,
  StavkaProizvodV2Zod,
]);

export const PrimalacFirmaV2Zod = z.object({
  tipPrimaoca: z.literal("firma"),
  firma_id: z.string().optional(),
  // `naziv` (firma branch) and `imeIPrezime` (fizicko branch) are the two
  // distinct name fields. Keeping `naziv` here matches V1's BE schema (Phase 2
  // will map V2 → BE 1:1 for the firma case). The collision that the V1 model
  // would have caused — same key meaning two different things on a union — is
  // already prevented by giving fizicko its own dedicated `imeIPrezime` key.
  naziv: z.string().min(1, "Naziv firme je obavezan"),
  pib: z.string().min(1, "PIB je obavezan"),
  maticniBroj: z.string().min(1, "Matični broj je obavezan"),
  adresa: z.string().optional(),
  mesto: z.string().optional(),
});

export const PrimalacFizickoV2Zod = z.object({
  tipPrimaoca: z.literal("fizicko"),
  imeIPrezime: z.string().min(1, "Ime i prezime je obavezno"),
  adresa: z.string().min(1, "Adresa je obavezna"),
  mesto: z.string().optional(),
  jmbg: z.string().optional(),
});

export const PrimalacRacunaV2Zod = z.discriminatedUnion("tipPrimaoca", [
  PrimalacFirmaV2Zod,
  PrimalacFizickoV2Zod,
]);

const BaseRacunV2Zod = z.object({
  izdavacRacuna: z.enum(IzdavacRacuna),
  tekuciRacun: z.string().min(1, "Tekući račun je obavezan"),
  pozivNaBroj: z.string().trim().min(1, "Poziv na broj je obavezan"),
  valuta: z.enum(VALUTA_VALUES).default("RSD"),
  defaultStopaPdv: nonNegativeNumber.default(20),
  primalacRacuna: PrimalacRacunaV2Zod,
});

const PredracunRacunV2Zod = BaseRacunV2Zod.extend({
  tipRacuna: z.literal(TipRacuna.PREDRACUN),
  stavke: z.array(StavkaV2Zod).min(1, "Dodajte bar jednu stavku"),
  rokZaUplatu: nonNegativeNumber.optional(),
});

const AvansniRacunV2Zod = BaseRacunV2Zod.extend({
  tipRacuna: z.literal(TipRacuna.AVANSNI_RACUN),
  avansBezPdv: nonNegativeNumber,
  // Avansni has no stavke, so the PDV rate lives on the invoice. Default 20.
  // Plan-aligned name (Phase 2 promotes this verbatim to the BE schema as
  // `stopaPdvAvansni`). When izdavac.pdvObveznik === false, the calculator
  // forces this to 0 internally, so callers don't have to remember.
  stopaPdvAvansni: nonNegativeNumber
    .max(50, "Stopa PDV-a mora biti <= 50")
    .default(20),
  datumUplateAvansa: z.coerce.date().nullable().optional(),
  stavke: z.never().optional(),
});

const KonacniRacunV2Zod = BaseRacunV2Zod.extend({
  tipRacuna: z.literal(TipRacuna.KONACNI_RACUN),
  stavke: z.array(StavkaV2Zod).min(1, "Dodajte bar jednu stavku"),
  // Single linked avansni (V1 parity). Required at the schema level — Pregled
  // surfaces the error when blank. Phase 3 will additionally validate that
  // this resolves to a real avansni by (izdavac + pozivNaBroj); Phase 1 only
  // requires a non-empty string and console.log's the lookup intent.
  linkedPozivNaBroj: z
    .string()
    .trim()
    .min(1, "Poziv na broj avansnog računa je obavezan"),
  rokZaUplatu: nonNegativeNumber.optional(),
});

const RacunRacunV2Zod = BaseRacunV2Zod.extend({
  tipRacuna: z.literal(TipRacuna.RACUN),
  stavke: z.array(StavkaV2Zod).min(1, "Dodajte bar jednu stavku"),
  placeno: nonNegativeNumber.optional(),
  rokZaUplatu: nonNegativeNumber.optional(),
});

export const RacunV2Zod = z.discriminatedUnion("tipRacuna", [
  PredracunRacunV2Zod,
  AvansniRacunV2Zod,
  KonacniRacunV2Zod,
  RacunRacunV2Zod,
]);

export type StavkaUslugaV2Form = z.input<typeof StavkaUslugaV2Zod>;
export type StavkaProizvodV2Form = z.input<typeof StavkaProizvodV2Zod>;
export type StavkaRacunaV2Form = z.input<typeof StavkaV2Zod>;

export type StavkaUslugaV2Parsed = z.output<typeof StavkaUslugaV2Zod>;
export type StavkaProizvodV2Parsed = z.output<typeof StavkaProizvodV2Zod>;
export type StavkaRacunaV2Parsed = z.output<typeof StavkaV2Zod>;

export type PrimalacFirmaV2Form = z.input<typeof PrimalacFirmaV2Zod>;
export type PrimalacFizickoV2Form = z.input<typeof PrimalacFizickoV2Zod>;
export type PrimalacRacunaV2Form = z.input<typeof PrimalacRacunaV2Zod>;

export type RacunV2Form = z.input<typeof RacunV2Zod>;
export type RacunV2Parsed = z.output<typeof RacunV2Zod>;
