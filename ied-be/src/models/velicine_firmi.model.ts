import { Schema, model } from "mongoose";

const velicina = {
  Mikro: "Mikro",
  mala: "Mala",
  srednja: "Srednja",
  velika: "Velika",
} as const;

export type Velicina = keyof typeof velicina;

export type VelicineFirmiType = Document & {
  ID_velicina_firme: number;
  velicina: Velicina;
};

const velicineFirmeSchema = new Schema<VelicineFirmiType>(
  {
    ID_velicina_firme: { type: Number, required: true },
    velicina: { type: String, enum: Object.values(velicina), required: true },
  },
  { collection: "velicine_firmi" }
);

export const VelicineFirmi = model<VelicineFirmiType>("VelicineFirmi", velicineFirmeSchema);
