import { addMonths, subMonths } from "date-fns";
import * as z from "zod";

export const ZaposleniSchema = z.object({
  _id: z.string().optional(),
  ID_kontakt_osoba: z.number().optional(),
  ime: z.string().optional(),
  prezime: z.string().optional(),
  e_mail: z
    .string()
    .email("Ne ispravna email adresa")
    .max(100, "Predugacka email adresa")
    .or(z.literal(""))
    .optional(),
  telefon: z.string().optional(),
  komentar: z.string().max(10000).optional(),
  radno_mesto: z.string().optional(),
});
export type Zaposleni = z.infer<typeof ZaposleniSchema>;

export const FirmaSchema = z.object({
  _id: z.string().optional(),
  ID_firma: z.number().optional(),
  naziv_firme: z.string().max(100).nullable().default(""),
  adresa: z.string().max(150).optional().nullable().default(""),
  PIB: z.string().or(z.literal("")).optional().nullable().default(""),
  telefon: z.string().nullable().default(""),
  e_mail: z
    .string()
    .email("Ne ispravna email adresa")
    .max(100, "Predugacka email adresa")
    .or(z.literal(""))
    .optional()
    .nullable()
    .default(""),
  tip_firme: z.string().optional().nullable().default(""),
  delatnost: z.string().optional().nullable().default(""),
  komentar: z.string().max(1000).optional().nullable().default(""),
  stanje_firme: z.string().max(50).optional().nullable().default(""),
  mesto: z.string().nullable().default(""),

  velicina_firme: z.string().optional().nullable().default(""),
  zaposleni: z.array(ZaposleniSchema).default([]),
  jbkjs: z
    .string()
    .regex(/^\d{5}$/, "JBKJS moze da se sastoji samo od 5 brojeva")
    .or(z.literal(""))
    .optional()
    .nullable()
    .default(""),
  maticni_broj: z.string().optional().or(z.literal("")).nullable().default(""),
});
export type FirmaType = z.infer<typeof FirmaSchema>;

const inputTypes = ["Text", "Switch", "Select", "TextMultiline"] as const;
export const InputTypesSchema = z.enum(inputTypes);

export const MetadataSchema = z.object({
  key: z.string(),
  label: z.string(),
  inputAdornment: z.any(),
  inputType: InputTypesSchema,
});

export type Metadata = z.infer<typeof MetadataSchema>;
export const ZodPrijavaNaSeminar = z.object({
  seminar_id: z.string(),
  firma_id: z.string(),
  firma_naziv: z.string().nullable().default(""),
  firma_email: z.string().nullable().default(""),
  firma_telefon: z.string().nullable().default(""),
  zaposleni_id: z.string(),
  zaposleni_ime: z.string().optional(),
  zaposleni_prezime: z.string().optional(),
  zaposleni_email: z.string().optional(),
  zaposleni_telefon: z.string().optional(),
  prisustvo: z.enum(["online", "offline", "ne znam"]).optional(),
});

export const SeminarSchema = z.object({
  _id: z.string().optional(),
  naziv: z
    .string()
    .min(3, "Naziv mora da ima bar 3 karaktera")
    .max(100, "Naziv ne sme da ima vise od 100 karaktera"),
  predavac: z
    .string()
    .min(3, "Predavac mora da ima bar 3 karaktera")
    .max(100, "Predavac ne sme da ima vise od 100 karaktera")
    .or(z.literal(""))
    .default(""),
  onlineCena: z
    .number()
    .min(0, "Online cena ne moze da bude negativna")
    .optional()
    .or(z.literal(""))
    .default(""),
  offlineCena: z
    .number()
    .min(0, "Offline ena ne moze da bude negativna")
    .optional()
    .or(z.literal(""))
    .default(""),
  cenaOd: z.number().optional(),
  cenaDo: z.number().optional(),
  lokacija: z
    .string()
    .min(3, "Lokacija mora da ima bar 3 karaktera")
    .max(100, "Lokacija ne sme da ima vise od 100 karaktera")
    .or(z.literal(""))
    .default(""),
  datum: z.string().optional().default(new Date().toISOString()),
  datumOd: z.string().optional().default(subMonths(new Date(), 3).toISOString()),
  datumDo: z.string().optional().default(addMonths(new Date(), 3).toISOString()),
  prijave: z.array(ZodPrijavaNaSeminar),
});

export type SeminarType = z.infer<typeof SeminarSchema>;
export type PrijavaNaSeminar = z.infer<typeof ZodPrijavaNaSeminar>;
