import { z } from "zod";

export const PrimalacRacunaSchema = z.object({
  naziv: z.string().min(1, { message: "Naziv primaoca je obavezan" }),
  adresa: z.string().optional(),
  pib: z.string().optional(),
  maticniBroj: z.string().optional(),
  mesto: z.string().optional(),
});

export const SeminarRacunSchema = z.object({
  naziv: z.string().min(1, { message: "Naziv seminara je obavezan" }),
  // Use preprocess to handle date strings from forms/JSON
  datum: z.preprocess(
    (arg) => {
      if (typeof arg == "string" || arg instanceof Date) return new Date(arg);
    },
    z.date({ required_error: "Datum seminara je obavezan" })
  ),
  lokacija: z.string().optional(),
  jedinicaMere: z.string().optional(),
  brojUcesnikaOnline: z.number().min(0).default(0),
  brojUcesnikaOffline: z.number().min(0).default(0),
  onlineCena: z.coerce.number().min(0).default(0),
  offlineCena: z.coerce.number().min(0).default(0),
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
  avansBezPdv: z.coerce.number().min(0).default(0),
});

export const CalculationsRacunSchema = z.object({
  onlineUkupnaNaknada: z.coerce.number().min(0).optional().default(0),
  offlineUkupnaNaknada: z.coerce.number().min(0).optional().default(0),
  onlinePoreskaOsnovica: z.coerce.number().min(0).optional().default(0),
  offlinePoreskaOsnovica: z.coerce.number().min(0).optional().default(0),
  pdvOnline: z.coerce.number().min(0).optional().default(0),
  pdvOffline: z.coerce.number().min(0).optional().default(0),
  avansPdv: z.coerce.number().min(0).optional().default(0),
  avans: z.coerce.number().min(0).optional().default(0),
  ukupnaNaknada: z.coerce.number().min(0).optional().default(0),
  ukupanPdv: z.coerce.number().min(0).optional().default(0),
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
  rokZaUplatu: z.coerce.number().optional(),
  pozivNaBroj: z.string().optional(),
  dateCreatedAt: z.date().optional(), // Added optional, BE sets default
  dateUpdatedAt: z.date().optional(), // Added optional, BE sets default
  stopaPdv: z.number().default(20),
});

// Inferred Types
export type Racun = z.infer<typeof RacunSchema>;
export type PrimalacRacuna = z.infer<typeof PrimalacRacunaSchema>;
export type SeminarRacun = z.infer<typeof SeminarRacunSchema>;
export type CalculationsRacun = z.infer<typeof CalculationsRacunSchema>;
