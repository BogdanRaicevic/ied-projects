import z from "zod";
import { SUPPRESSION_REASONS } from "../constants/email";

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
  naziv_firme: z.string().max(100).optional(),
  adresa: z.string().max(150).optional(),
  PIB: z.string().or(z.literal("")).optional(),
  telefon: z.string().optional(),
  e_mail: z
    .email("Neispravna email adresa")
    .max(100, "Predugacka email adresa")
    .or(z.literal(""))
    .optional(),
  tip_firme: z.string().optional(),
  delatnost: z.string().optional(),
  komentar: z.string().max(1000).optional(),
  stanje_firme: z.string().max(50).optional(),
  mesto: z.string().optional(),
  velicina_firme: z.string().optional(),
  zaposleni: z.array(ZaposleniSchema).optional(),
  jbkjs: z
    .string()
    .regex(/^\d{5}$/, "JBKJS moze da se sastoji samo od 5 brojeva")
    .or(z.literal(""))
    .optional(),
  maticni_broj: z.string().or(z.literal("")).optional(),
  prijavljeni: z.boolean(),
});

export type ZaposleniType = z.infer<typeof ZaposleniSchema>;
export type FirmaType = z.infer<typeof FirmaSchema>;

export type ExportZaposlenih = z.infer<typeof ExportZaposlenihSchema>;
export type ExportFirma = z.infer<typeof ExportFirmaSchema>;

export const SuppressedEmailSchema = z.object({
  email: z.email("Neispravna email adresa"),
  reason: z.enum(SUPPRESSION_REASONS),
});

export type SuppressedEmail = z.infer<typeof SuppressedEmailSchema>;
