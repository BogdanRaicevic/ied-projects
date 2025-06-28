import z from "zod";

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
  negacije: z.array(z.string()).optional(),
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
});
export type FirmaQueryParams = z.infer<typeof FirmaQueryParamsSchema>;
