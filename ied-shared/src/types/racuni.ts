import { z } from "zod";

export const IzdavacRacunaSchema = z.object({
  naziv: z.string(),
  kontaktTelefoni: z.array(z.string()),
  pib: z.number(),
  maticniBroj: z.number(),
  adresa: z.string(),
  mesto: z.string(),
  brojResenjaOEvidencijiZaPdv: z.string(),
  tekuciRacun: z.string(),
});

export const PrimalacRacunaSchema = z.object({
  naziv: z.string(),
  adresa: z.string(),
  pib: z.number(),
  maticniBroj: z.number(),
  mesto: z.string(),
});

export const SeminarRacunSchema = z.object({
  naziv: z.string(),
  datum: z.date(),
  lokacija: z.string(),
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

export const TipRacuna = ["predracun", "racun", "avansniRacun", "konacniRacun"] as const;

export const RacunSchema = z.object({
  seminar: SeminarRacunSchema.required(),
  izdavacRacuna: IzdavacRacunaSchema.required(),
  primalacRacuna: PrimalacRacunaSchema.required(),
  calculations: CalculationsRacunSchema.optional(),

  tipRacuna: z.enum(TipRacuna).optional(),
  stopaPdv: z.number().default(20),
  rokZaUplatu: z.number().optional(),
  pozivNaBroj: z.number(),
  dateCreatedAt: z.date().default(() => new Date()),
  dateUpdatedAt: z.date().default(() => new Date()),
});

export type Racun = z.infer<typeof RacunSchema>;
export type IzdavacRacuna = z.infer<typeof IzdavacRacunaSchema>;
export type PrimalacRacuna = z.infer<typeof PrimalacRacunaSchema>;
export type SeminarRacun = z.infer<typeof SeminarRacunSchema>;
export type CalculationsRacun = z.infer<typeof CalculationsRacunSchema>;
