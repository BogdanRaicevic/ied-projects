import z from "zod";
import { SUPPRESSION_REASONS } from "../constants/email";
import { NEGACIJA } from "../constants/firma";

export const ExportZaposlenihSchema = z.array(
  z.object({
    imePrezime: z.string().optional(),
    e_mail: z.string().optional(),
    naziv_firme: z.string().optional(),
    radno_mesto: z.string().optional(),
  }),
);

export const ExportFirmaSchema = z.array(
  z.object({
    naziv_firme: z.string().optional(),
    e_mail: z.string().optional(),
    delatnost: z.string().optional(),
    tip_firme: z.string().optional(),
  }),
);

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
  prijavljeni: z.boolean(),
});

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
  prijavljeni: z.boolean().default(true),
});

export type ZaposleniType = z.infer<typeof ZaposleniSchema>;
export type FirmaType = z.infer<typeof FirmaSchema>;

export type ExportZaposlenih = z.infer<typeof ExportZaposlenihSchema>;
export type ExportFirma = z.infer<typeof ExportFirmaSchema>;

export const FirmaQueryParamsSchema = z.object({
  imeFirme: z.string().optional(),
  pib: z.string().optional(),
  email: z.string().optional(),
  mesta: z.array(z.string()).optional(),
  delatnosti: z.array(z.string()).optional(),
  tipoviFirme: z.array(z.string()).optional(),
  radnaMesta: z.array(z.string()).optional(),
  velicineFirmi: z.array(z.string()).optional(),
  negacije: z.array(z.enum(NEGACIJA)).optional(),
  stanjaFirme: z.array(z.string()).optional(),
  jbkjs: z.string().optional(),
  maticniBroj: z.string().optional(),
  komentar: z.string().optional(),
  seminari: z
    .array(
      z.object({
        _id: z.string(),
        naziv: z.string(),
        datum: z.union([z.string(), z.date()]),
      }),
    )
    .optional(),
  imePrezime: z.string().optional(),
  emailZaposlenog: z.string().optional(),
  firmaPrijavljeni: z.boolean().optional(),
  zaposleniPrijavljeni: z.boolean().optional(),
  tipSeminara: z.array(z.string()).optional(),
});
export type FirmaQueryParams = z.infer<typeof FirmaQueryParamsSchema>;

export const SuppressedEmailSchema = z.object({
  email: z.email("Neispravna email adresa"),
  reason: z.enum(SUPPRESSION_REASONS),
});

export type SuppressedEmail = z.infer<typeof SuppressedEmailSchema>;
