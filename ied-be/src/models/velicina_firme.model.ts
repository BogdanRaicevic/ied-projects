import { Schema, model } from "mongoose";

export type VelicineFirmiType = Document & {
  ID_velicina_firme: number;
  velicina: string;
};

const velicineFirmeSchema = new Schema<VelicineFirmiType>(
  {
    ID_velicina_firme: { type: Number, required: true },
    velicina: { type: String, required: true },
  },
  { collection: "velicine_firmi" }
);

export const VelicineFirmi = model<VelicineFirmiType>("VelicineFirmi", velicineFirmeSchema);
