import { z } from "zod";

export const SertifikatZod = z.object({
  sertifikat_broj: z.int().positive({
    message: "Broj sertifikata mora biti pozitivan ceo broj",
  }),
  datum_seminara: z.string().min(1, { message: "Datum seminara je obavezan" }),
  godina_seminara: z
    .string()
    .min(1, { message: "Godina seminara je obavezna" }),
  ime_prezime: z.string().min(1, { message: "Ime i prezime je obavezno" }),
  seminar_naziv: z.string().min(1, { message: "Naziv seminara je obavezan" }),
  firma_naziv: z.string().min(1, { message: "Naziv firme je obavezan" }),
});

export type SertifikatType = z.infer<typeof SertifikatZod>;

export const SertifikatBatchZod = z
  .array(SertifikatZod)
  .min(1, { message: "Potreban je bar jedan sertifikat za generisanje" });
