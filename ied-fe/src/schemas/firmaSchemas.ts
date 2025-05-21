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
  adresa: z.string().max(150).nullable().default(""),
  PIB: z.string().or(z.literal("")).nullable().default(""),
  telefon: z.string().nullable().default(""),
  e_mail: z
    .string()
    .email("Ne ispravna email adresa")
    .max(100, "Predugacka email adresa")
    .or(z.literal(""))
    .nullable()
    .default(""),
  tip_firme: z.string().nullable().default(""),
  delatnost: z.string().nullable().default(""),
  komentar: z.string().max(1000).nullable().default(""),
  stanje_firme: z.string().max(50).nullable().default(""),
  mesto: z.string().nullable().default(""),

  velicina_firme: z.string().nullable().default(""),
  zaposleni: z.array(ZaposleniSchema).default([]),
  jbkjs: z
    .string()
    .regex(/^\d{5}$/, "JBKJS moze da se sastoji samo od 5 brojeva")
    .or(z.literal(""))
    .nullable()
    .default(""),
  maticni_broj: z.string().or(z.literal("")).nullable().default(""),
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
