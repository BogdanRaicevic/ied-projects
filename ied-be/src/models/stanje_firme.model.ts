import { model, Schema, type Types } from "mongoose";

export type StanjeFirmeType = {
  _id: Types.ObjectId;
  stanje_firme: string;
};

const stanjeFirmeSchema = new Schema<StanjeFirmeType>(
  {
    stanje_firme: { type: String, required: true },
  },
  { collection: "stanja_firme" },
);

export const StanjeFirme = model<StanjeFirmeType>(
  "StanjeFirme",
  stanjeFirmeSchema,
);
