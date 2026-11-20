import { z } from "zod";
import { IzdavacRacuna } from "./racuni.zod";

// One document of the `izdavaci` collection (GET /api/izdavaci). Same fields
// as ied-be/src/constants/izdavacRacuna.const.ts, which is pasted from.
export const IzdavacZod = z.object({
  id: z.enum(IzdavacRacuna),
  naziv: z.string(),
  kontaktTelefoni: z.array(z.string()),
  pib: z.number(),
  maticniBroj: z.number(),
  brojResenjaOEvidencijiZaPDV: z.string().optional(),
  tekuciRacuni: z.array(z.string()),
  pdvObveznik: z.boolean(),
});

export type IzdavacType = z.infer<typeof IzdavacZod>;
