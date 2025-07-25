import { type Document, model, Schema } from "mongoose";

type StanjeFirmeType = Document & {
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
