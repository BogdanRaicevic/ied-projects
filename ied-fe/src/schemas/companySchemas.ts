import * as z from "zod";

export const ZaposleniSchema = z.object({
  _id: z.string().optional(),
  ID_kontakt_osoba: z.optional(z.number()),
  ime: z.string().min(3, "Ime mora da ima bar 3 karaktera"),
  prezime: z.string().min(3, "Prezime mora da ima bar 3 karaktera"),
  e_mail: z
    .string()
    .email("Ne ispravna email adresa")
    .max(100, "Predugacka email adresa")
    .or(z.literal(""))
    .optional(),
  telefon: z.string(),
  komentar: z.string().max(10000),
  radno_mesto: z.string(),
});
export type Zaposleni = z.infer<typeof ZaposleniSchema>;

export const PoseceniSeminarSchema = z.object({
  naziv: z.string(),
  datum: z.string(),
  ucesnici: z.array(z.string()),
});

export type PoseceniSeminar = z.infer<typeof PoseceniSeminarSchema>;

export const CompanySchema = z.object({
  _id: z.string().optional(),
  ID_firma: z.number(),
  zeleMarketingMaterijal: z.optional(z.boolean().default(false)),
  naziv_firme: z.string().max(100),
  adresa: z.string().max(150),
  PIB: z.optional(z.string()),
  telefon: z.string(),
  e_mail: z
    .string()
    .email("Ne ispravna email adresa")
    .max(100, "Predugacka email adresa")
    .or(z.literal(""))
    .optional(),
  tip_firme: z.string(),
  delatnost: z.optional(z.string()),
  komentar: z.string().max(1000),
  stanje_firme: z.string().max(50),
  mesto: z.string().max(50),
  postanski_broj: z
    .string()
    .regex(new RegExp("^\\d{5}$"), "PTT moze da se sastoji samo od 5 brojeva")
    .or(z.literal(""))
    .optional(),
  velicina: z.string(),
  lastTouched: z.optional(z.string()),
  zaposleni: z.array(ZaposleniSchema).default([]),
  seminari: z.optional(z.array(PoseceniSeminarSchema)).default([]),
  jbkjs: z
    .string()
    .regex(new RegExp("^\\d{5}$"), "JBKJS moze da se sastoji samo od 5 brojeva")
    .or(z.literal(""))
    .optional(),
  maticni_broj: z.string().optional(),
});
export type Company = z.infer<typeof CompanySchema>;

const inputTypes = ["Text", "Switch", "Select", "TextMultiline"] as const;
export const InputTypesSchema = z.enum(inputTypes);

export const MetadataSchema = z.object({
  key: z.string(),
  label: z.string(),
  inputAdornment: z.any(),
  inputType: InputTypesSchema,
});

export type Metadata = z.infer<typeof MetadataSchema>;

export const SeminarSchema = z.object({
  id: z.string().optional(),
  naziv: z
    .string()
    .min(3, "Naziv mora da ima bar 3 karaktera")
    .max(100, "Naziv ne sme da ima vise od 100 karaktera"),
  predavac: z
    .string()
    .min(3, "Predavac mora da ima bar 3 karaktera")
    .max(100, "Predavac ne sme da ima vise od 100 karaktera")
    .or(z.literal("")),
  onlineCena: z.number().min(0, "Online cena ne moze da bude negativna").optional(),
  offlineCena: z.number().min(0, "Offline ena ne moze da bude negativna").optional(),
  cenaOd: z.number().optional(),
  cenaDo: z.number().optional(),
  lokacija: z
    .string()
    .min(3, "Lokacija mora da ima bar 3 karaktera")
    .max(100, "Lokacija ne sme da ima vise od 100 karaktera")
    .or(z.literal("")),
  datum: z.date().optional(),
  datumOd: z.date().optional(),
  datumDo: z.date().optional(),
});
export type Seminar = z.infer<typeof SeminarSchema>;
