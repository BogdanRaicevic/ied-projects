import { z } from "zod";
import { IzdavacRacuna } from "./racuni.zod";

// One document of the `izdavaci` collection (GET /api/izdavaci).
// `sifra` is the business code. `_id` is assigned by Mongo.
export const IzdavacZod = z.object({
  _id: z.string().optional(),
  sifra: z.enum(IzdavacRacuna),
  naziv: z.string(),
  kontaktTelefoni: z.array(z.string()),
  pib: z.number(),
  maticniBroj: z.number(),
  brojResenjaOEvidencijiZaPDV: z.string().optional(),
  tekuciRacuni: z.array(z.string()),
  pdvObveznik: z.boolean(),
});

export type IzdavacType = z.infer<typeof IzdavacZod>;
