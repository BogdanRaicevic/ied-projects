import { z } from "zod";

export const TipSeminaraSchema = z.object({
  tipSeminara: z.string(),
});

export const TipSeminaraFromDBSchema = TipSeminaraSchema.extend({
  _id: z.string(),
});

export type TipSeminara = z.infer<typeof TipSeminaraSchema>;
export type TipSeminaraFromDB = z.infer<typeof TipSeminaraFromDBSchema>;
