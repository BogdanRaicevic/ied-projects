import { type Document, model, Schema } from "mongoose";

export type RadnoMestoType = Document & {
  radno_mesto: string;
};

const radnoMestoSchema = new Schema<RadnoMestoType>(
  {
    radno_mesto: { type: String, required: true },
  },
  { collection: "radna_mesta" },
);

export const RadnoMesto = model<RadnoMestoType>("RadnoMesto", radnoMestoSchema);
