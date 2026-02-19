import { z } from "zod";

export const RadnoMestoSchema = z.object({
  radno_mesto: z.string(),
});

export const RadnoMestoFromDBSchema = RadnoMestoSchema.extend({
  _id: z.string(),
});

export type RadnoMestoType = z.infer<typeof RadnoMestoSchema>;
export type RadnoMestoFromDBType = z.infer<typeof RadnoMestoFromDBSchema>;
