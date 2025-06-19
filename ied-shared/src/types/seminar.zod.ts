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
});

export const SeminarSchema = z.object({
  _id: z.string().optional(),
  naziv: z.string().min(1, "Naziv seminara je obavezan"),
  predavac: z.string().optional(),
  lokacija: z.string().optional(),
  offlineCena: z.coerce.number().min(0).nonnegative("Cena ne može biti negativna").default(0),
  onlineCena: z.coerce.number().min(0).nonnegative("Cena ne može biti negativna").default(0),
  datum: z.coerce.date(),
  detalji: z.string().optional(),
  prijave: z.array(PrijavaSchema).default([]),
});

export const SeminarQueryParamsSchema = z.object({
  naziv: z.string().optional(),
  lokacija: z.string().optional(),
  predavac: z.string().optional(),
  datumOd: z.coerce.date().optional(),
  datumDo: z.coerce.date().optional(),
  datum: z.coerce.date().optional(),
});

export type PrijavaZodType = z.infer<typeof PrijavaSchema>;
export type SeminarZodType = z.infer<typeof SeminarSchema>;
export type SeminarQueryParamsZodType = z.infer<typeof SeminarQueryParamsSchema>;
