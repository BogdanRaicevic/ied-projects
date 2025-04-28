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
  ), // Required
  lokacija: z.string().optional(),
  jedinicaMere: z.string().optional(),
  brojUcesnikaOnline: z.number().default(0),
  brojUcesnikaOffline: z.number().default(0),
  onlineCena: z.number().default(0),
  offlineCena: z.number().default(0),
  popustOnline: z.number().default(0),
  popustOffline: z.number().default(0),
  avansBezPdv: z.number().default(0),
});

export const CalculationsRacunSchema = z.object({
  onlineUkupnaNaknada: z.number().default(0),
  offlineUkupnaNaknada: z.number().default(0),
  onlinePoreskaOsnovica: z.number().default(0),
  offlinePoreskaOsnovica: z.number().default(0),
  pdvOnline: z.number().default(0),
  pdvOffline: z.number().default(0),
  avansPdv: z.number().default(0),
  avans: z.number().default(0),
  ukupnaNaknada: z.number().default(0),
  ukupanPdv: z.number().default(0),
});

export const RacunSchema = z.object({
  izdavacRacuna: z.enum(["ied", "permanent", "bs"]),
  tipRacuna: z.enum(["predracun", "racun", "avansniRacun", "konacniRacun"]),
  tekuciRacun: z.string().min(1, { message: "Tekući račun je obavezan" }),
  primalacRacuna: PrimalacRacunaSchema,
  seminar: SeminarRacunSchema,
  calculations: CalculationsRacunSchema.optional(),
  rokZaUplatu: z.number().optional(),
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
