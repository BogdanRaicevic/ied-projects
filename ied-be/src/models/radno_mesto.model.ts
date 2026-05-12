import { model, Schema, type Types } from "mongoose";

export type RadnoMestoType = {
  _id: Types.ObjectId;
  radno_mesto: string;
};

const radnoMestoSchema = new Schema<RadnoMestoType>(
  {
    radno_mesto: { type: String, required: true },
  },
  { collection: "radna_mesta" },
);

export const RadnoMesto = model<RadnoMestoType>("RadnoMesto", radnoMestoSchema);
