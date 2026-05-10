import { model, Schema, type Types } from "mongoose";

export type VelicineFirmiType = {
  _id: Types.ObjectId;
  ID_velicina_firme: number;
  velicina_firme: string;
};

const velicineFirmeSchema = new Schema<VelicineFirmiType>(
  {
    ID_velicina_firme: { type: Number, required: true },
    velicina_firme: { type: String, required: true },
  },
  { collection: "velicine_firmi" },
);

export const VelicineFirmi = model<VelicineFirmiType>(
  "VelicineFirmi",
  velicineFirmeSchema,
);
