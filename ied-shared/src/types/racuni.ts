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

export const RacunTypes = ["predracun", "racun", "avansniRacun", "konacniRacun"] as const;

export const RacunSchema = z.object({
  izdavacRacuna: IzdavacRacunaSchema.required(),
  tipRacuna: z.enum(RacunTypes).optional(),
  primalacRacuna: PrimalacRacunaSchema.required(),
  nazivSeminara: z.string().optional(),
  datumOdrzavanjaSeminara: z.date().optional(),
  datumPrometaUsluge: z.date().optional(),
  jedinicaMere: z.string().optional(),
  brojUcesnikaOnline: z.number().default(0),
  brojUcesnikaOffline: z.number().default(0),
  onlineCena: z.number().default(0),
  offlineCena: z.number().default(0),
  popustOnline: z.number().default(0),
  popustOffline: z.number().default(0),
  stopaPdv: z.number().optional(),
  onlineUkupnaNaknada: z.number().default(0),
  offlineUkupnaNaknada: z.number().default(0),
  onlinePoreskaOsnovica: z.number().default(0),
  offlinePoreskaOsnovica: z.number().default(0),
  avansPdv: z.number().default(0),
  avans: z.number().default(0),
  ukupnaNaknada: z.number().default(0),
  ukupanPdv: z.number().default(0),
  rokZaUplatu: z.number().optional(),
  pozivNaBroj: z.number().optional(),
  dateCreatedAt: z.date().default(() => new Date()),
  dateUpdatedAt: z.date().default(() => new Date()),
});

export type Racun = z.infer<typeof RacunSchema>;
export type IzdavacRacuna = z.infer<typeof IzdavacRacunaSchema>;
export type PrimalacRacuna = z.infer<typeof PrimalacRacunaSchema>;
