import { z } from "zod";

export const PrijavaSchema = z.object({
  _id: z.string().optional(),
  firma_id: z.string(),
  firma_naziv: z.string(),
  firma_email: z.string().optional(),
  firma_telefon: z.string().optional(),
  zaposleni_id: z.string(),
  zaposleni_ime: z.string().optional(),
  zaposleni_prezime: z.string().optional(),
  zaposleni_email: z.string().optional(),
  zaposleni_telefon: z.string().optional(),
  prisustvo: z.enum(["online", "offline"]),
  vrsta_prijave: z.enum(["telefon", "email", "drustvene_mreze"]),
});

export const SeminarSchema = z.object({
  _id: z.string().optional(),
  naziv: z.string().min(1, "Naziv seminara je obavezan"),
  predavac: z.string().optional(),
  lokacija: z.string().optional(),
  offlineCena: z.coerce
    .number()
    .min(0)
    .nonnegative("Cena ne može biti negativna")
    .default(0),
  onlineCena: z.coerce
    .number()
    .min(0)
    .nonnegative("Cena ne može biti negativna")
    .default(0),
  datum: z.coerce.date(),
  detalji: z.string().optional(),
  prijave: z.array(PrijavaSchema).default([]),
});

export const SeminarQueryParamsSchema = z.object({
  naziv: z.string().default(""),
  lokacija: z.string().default(""),
  predavac: z.string().default(""),
  datumOd: z.coerce.date().optional(),
  datumDo: z.coerce.date().optional(),
  datum: z.coerce.date().optional(),
});

export type PrijavaZodType = z.infer<typeof PrijavaSchema>;
export type SeminarZodType = z.infer<typeof SeminarSchema>;
export type SeminarQueryParams = z.infer<typeof SeminarQueryParamsSchema>;

export const ExtendedSearchSeminarZod = SeminarQueryParamsSchema.extend({
  pageIndex: z.coerce.number().default(0),
  pageSize: z.coerce.number().default(50),
});

export type ExtendedSearchSeminarType = z.infer<
  typeof ExtendedSearchSeminarZod
>;

export const FirmaSeminarSearchParamsSchema = z.object({
  nazivFirme: z.string().default(""),
  nazivSeminara: z.string().default(""),
  tipFirme: z.array(z.string()).default([]),
  delatnost: z.array(z.string()).default([]),
  radnaMesta: z.array(z.string()).default([]),
  velicineFirme: z.array(z.string()).default([]),
  predavac: z.string().default(""),
  datumOd: z.coerce.date().optional(),
  datumDo: z.coerce.date().optional(),
});

export type FirmaSeminarSearchParams = z.infer<
  typeof FirmaSeminarSearchParamsSchema
>;

export const SeminarDetailSchema = z.object({
  seminar_id: z.string(),
  naziv: z.string(),
  predavac: z.string(),
  datum: z.string(),
  offlineCena: z.number(),
  onlineCena: z.number(),
  totalUcesnici: z.number(),
  onlineUcesnici: z.number(),
  offlineUcesnici: z.number(),
});
export type SeminarDetail = z.infer<typeof SeminarDetailSchema>;

export const FirmaSeminarSchema = z.object({
  firmaId: z.string(),
  naziv: z.string(),
  email: z.string(),
  mesto: z.string(),
  tipFirme: z.string(),
  delatnost: z.string(),
  brojSeminara: z.number(),
  totalUcesnici: z.number(),
  onlineUcesnici: z.number(),
  offlineUcesnici: z.number(),
  seminars: z.array(SeminarDetailSchema),
});
export type FirmaSeminar = z.infer<typeof FirmaSeminarSchema>;
