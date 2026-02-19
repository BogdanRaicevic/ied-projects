import { z } from "zod";

export const MestoSchema = z.object({
  naziv_mesto: z.string(),
  postanski_broj: z.string().optional(),
});

export const MestoFromDBSchema = MestoSchema.extend({
  _id: z.string(),
});

export type MestoType = z.infer<typeof MestoSchema>;
export type MestoFromDBType = z.infer<typeof MestoFromDBSchema>;
