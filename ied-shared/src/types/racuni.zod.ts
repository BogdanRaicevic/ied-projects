import { z } from "zod";

export const PrimalacRacunaSchema = z.object({
  firma_id: z.string(),
  naziv: z.string().min(1, { message: "Naziv primaoca je obavezan" }),
  adresa: z.string().optional(),
  pib: z.string().optional(),
  maticniBroj: z.string().optional(),
  mesto: z.string().optional(),
});

export const SeminarRacunSchema = z.object({
  seminar_id: z.string(),
  naziv: z.string().min(1, { message: "Naziv seminara je obavezan" }),
  // Use preprocess to handle date strings from forms/JSON
  datum: z.preprocess(
    (arg) => {
      if (typeof arg === "string" || arg instanceof Date) return new Date(arg);
    },
    z.date({ required_error: "Datum seminara je obavezan" }),
  ),
  lokacija: z.string().optional(),
  jedinicaMere: z.string().optional(),
  brojUcesnikaOnline: z.number().min(0).default(0),
  brojUcesnikaOffline: z.number().min(0).default(0),
  onlineCena: z.coerce.number().min(0).default(0),
  offlineCena: z.coerce.number().min(0).default(0),
});

export const CalculationsRacunSchema = z.object({
  onlineUkupnaNaknada: z.coerce.number().min(0).default(0),
  offlineUkupnaNaknada: z.coerce.number().min(0).default(0),
  onlinePoreskaOsnovica: z.coerce.number().min(0).default(0),
  offlinePoreskaOsnovica: z.coerce.number().min(0).default(0),
  popustOnline: z.coerce
    .number()
    .min(0, { message: "Popust online mora biti između 0 i 100" })
    .max(100, { message: "Popust online mora biti između 0 i 100" })
    .default(0),
  popustOffline: z.coerce
    .number()
    .min(0, { message: "Popust offline mora biti između 0 i 100" })
    .max(100, { message: "Popust offline mora biti između 0 i 100" })
    .default(0),
  pdvOnline: z.coerce.number().min(0).default(0),
  pdvOffline: z.coerce.number().min(0).default(0),
  avansPdv: z.coerce.number().min(0).default(0),
  avans: z.coerce.number().min(0).default(0),
  ukupnaNaknada: z.coerce.number().min(0).default(0),
  ukupanPdv: z.coerce.number().min(0).default(0),
  avansBezPdv: z.coerce.number().min(0).default(0),
  placeno: z.coerce.number().min(0).default(0),
});

export enum TipRacuna {
  PREDRACUN = "predracun",
  AVANSNI_RACUN = "avansniRacun",
  KONACNI_RACUN = "konacniRacun",
  RACUN = "racun",
}

export enum IzdavacRacuna {
  IED = "ied",
  PERMANENT = "permanent",
  BS = "bs",
}

export const RacunSchema = z.object({
  izdavacRacuna: z.nativeEnum(IzdavacRacuna),
  tipRacuna: z.nativeEnum(TipRacuna),
  tekuciRacun: z.string().min(1, { message: "Tekući račun je obavezan" }),
  primalacRacuna: PrimalacRacunaSchema,
  seminar: SeminarRacunSchema,
  calculations: CalculationsRacunSchema,
  rokZaUplatu: z.coerce.number().default(0),
  datumUplateAvansa: z.coerce.date().optional(),
  pozivNaBroj: z.string().optional(),
  dateCreatedAt: z.coerce.date().optional(),
  dateUpdatedAt: z.coerce.date().optional(),
  stopaPdv: z.coerce.number().default(20),
  linkedPozivNaBroj: z.string().optional(),
  _id: z.string().optional(),
});

export const RacunQuerySchema = z.object({
  pozivNaBroj: z.string().min(1, "pozivNaBroj is required"),
  izdavacRacuna: z.nativeEnum(IzdavacRacuna),
  tipRacuna: z.nativeEnum(TipRacuna).optional(),
});

export const PretrageRacunaSchma = z.object({
  pozivNaBroj: z.coerce.number().nonnegative().optional(),
  datumOd: z.coerce.date().optional(),
  datumDo: z.coerce.date().optional(),
  izdavacRacuna: z.array(z.nativeEnum(IzdavacRacuna)).optional(),
  tipRacuna: z.array(z.nativeEnum(TipRacuna)).optional(),
  imeFirme: z.string().optional(),
  pibFirme: z.coerce.number().nonnegative().optional(),
  nazivSeminara: z.string().optional(),
});

// Inferred Types
export type RacunZod = z.infer<typeof RacunSchema>;
export type PrimalacRacunaZod = z.infer<typeof PrimalacRacunaSchema>;
export type SeminarRacunZod = z.infer<typeof SeminarRacunSchema>;
export type CalculationsRacunZod = z.infer<typeof CalculationsRacunSchema>;
export type RacunQueryZod = z.infer<typeof RacunQuerySchema>;
export type PretrageRacunaZodType = z.infer<typeof PretrageRacunaSchma>;
