import { z } from "zod";

export const TipSeminaraSchema = z.object({
  tipSeminara: z.string().trim().min(1, "Tip seminara je obavezan").max(100, "Tip seminara ne može biti duži od 100 karaktera"),
});

export const TipSeminaraFromDBSchema = TipSeminaraSchema.extend({
  _id: z.string(),
});

export type TipSeminara = z.infer<typeof TipSeminaraSchema>;
export type TipSeminaraFromDB = z.infer<typeof TipSeminaraFromDBSchema>;
