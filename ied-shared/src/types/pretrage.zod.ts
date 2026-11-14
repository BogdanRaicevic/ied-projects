import z from "zod";
import { NEGACIJA } from "../constants/firma";
import { MAILING_STATUS } from "../constants/mailingStatus";

export const ParametriPretrageSchema = z
  .object({
    imeFirme: z.string(),
    pib: z.string(),
    email: z.string(),
    mesta: z.array(z.string()),
    delatnosti: z.array(z.string()),
    tipoviFirme: z.array(z.string()),
    radnaMesta: z.array(z.string()),
    velicineFirme: z.array(z.string()),
    negacije: z.array(z.enum(NEGACIJA)),
    stanjaFirme: z.array(z.string()),
    jbkjs: z.string(),
    maticniBroj: z.string(),
    komentar: z.string(),
    imePrezime: z.string(),
    emailZaposlenog: z.string(),
    firmaMailingStatus: z.array(z.enum(MAILING_STATUS)),
    zaposleniMailingStatus: z.array(z.enum(MAILING_STATUS)),
    tipoviSeminara: z.array(z.string()),
    seminari: z.array(z.string()),
  })
  .partial();

export type ParametriPretrage = z.infer<typeof ParametriPretrageSchema>;

export const PretragaSchema = z
  .object({
    _id: z.string().optional(),
    nazivPretrage: z.string().optional(),
  })
  .extend(ParametriPretrageSchema.shape);

export type PretragaType = z.infer<typeof PretragaSchema>;
