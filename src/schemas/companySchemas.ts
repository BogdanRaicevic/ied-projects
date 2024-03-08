import * as z from "zod";

export const ZaposleniSchema = z.object({
  id: z.string().optional(),
  firmaId: z.string().optional(),
  ime: z.string().min(3, "Ime mora da ima bar 3 karaktera"),
  prezime: z.string().min(3, "Prezime mora da ima bar 3 karaktera"),
  email: z.string(),
  telefon: z.string(),
  zeleMarketingMaterijal: z.boolean().default(true),
  brojSertifikata: z.string().optional(),
  komentari: z.string().max(10000),
  radnaMesta: z.array(z.string()),
});
export type Zaposleni = z.infer<typeof ZaposleniSchema>;

export const PoseceniSeminarSchema = z.object({
  naziv: z.string(),
  datum: z.string(),
  ucesnici: z.array(z.string()),
});

export type PoseceniSeminar = z.infer<typeof PoseceniSeminarSchema>;

export const CompanySchema = z.object({
  id: z.optional(z.string()),
  zeleMarketingMaterijal: z.boolean().default(false),
  sajt: z.string().max(50, "link za web sajt je predugacak"),
  naziv: z.string().max(100),
  adresa: z.string().max(150),
  grad: z.string().max(50),
  opstina: z.string().max(100),
  pib: z.string().regex(new RegExp("^\\d{9}$"), "PIB moze da se sastoji samo od brojeva 9 brojeva"),
  ptt: z.string().regex(new RegExp("^\\d{5}$"), "PTT moze da se sastoji samo od 5 brojeva"),
  telefon: z.string(),
  email: z.string().email("Ne ispravna email adresa").max(100, "Predugacka email adresa"),
  tip: z.string(),
  velicina: z.string(),
  stanje: z.string(),
  odjava: z.boolean(),
  komentari: z.string().max(1000),
  lastTouched: z.optional(z.string()),
  zaposleni: z.array(ZaposleniSchema),
  seminari: z.array(PoseceniSeminarSchema),
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
    .max(100, "Predavac ne sme da ima vise od 100 karaktera"),
  osnovnaCena: z.number().min(0, "Cena ne moze da bude negativna"),
  mesto: z
    .string()
    .min(3, "Mesto mora da ima bar 3 karaktera")
    .max(100, "Mesto ne sme da ima vise od 100 karaktera"),
  tipSeminara: z.string(),
  datum: z.date(),
  arhiviran: z.boolean().default(false).optional(),
  ucesnici: z
    .array(
      z.object({
        naziv: z.string(),
        id: z.string(),
        zaposleni: z.array(
          z.object({
            id: z.string(),
            ime: z.string(),
            prezime: z.string(),
            email: z.string(),
          })
        ),
      })
    )
    .optional(),
});
export type Seminar = z.infer<typeof SeminarSchema>;
