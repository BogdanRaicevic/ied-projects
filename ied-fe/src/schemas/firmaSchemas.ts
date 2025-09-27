import * as z from "zod";

export const ZaposleniSchema = z.object({
  _id: z.string().optional(),
  ID_kontakt_osoba: z.number().optional(),
  ime: z.string().optional(),
  prezime: z.string().optional(),
  e_mail: z
    .email("Neispravna email adresa")
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
  naziv_firme: z.string().max(100).default(""),
  adresa: z.string().max(150).default(""),
  PIB: z.string().or(z.literal("")).default(""),
  telefon: z.string().default(""),
  e_mail: z
    .email("Neispravna email adresa")
    .max(100, "Predugacka email adresa")
    .or(z.literal(""))

    .default(""),
  tip_firme: z.string().default(""),
  delatnost: z.string().default(""),
  komentar: z.string().max(1000).default(""),
  stanje_firme: z.string().max(50).default(""),
  mesto: z.string().default(""),

  velicina_firme: z.string().default(""),
  zaposleni: z.array(ZaposleniSchema).default([]),
  jbkjs: z
    .string()
    .regex(/^\d{5}$/, "JBKJS moze da se sastoji samo od 5 brojeva")
    .or(z.literal(""))
    .default(""),
  maticni_broj: z.string().or(z.literal("")).default(""),
});
export type FirmaType = z.infer<typeof FirmaSchema>;

const inputTypes = ["Text", "Switch", "Select", "TextMultiline"] as const;
export const InputTypesSchema = z.enum(inputTypes);

const MetadataSchema = z.object({
  key: z.string(),
  label: z.string(),
  inputAdornment: z.any(),
  inputType: InputTypesSchema,
});

export type Metadata = z.infer<typeof MetadataSchema>;
