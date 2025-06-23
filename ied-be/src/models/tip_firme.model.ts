import { Document, Schema, model } from "mongoose";

type TipFirmeType = Document & {
  tip_firme: string;
};

const tipFirmeSchema = new Schema<TipFirmeType>(
  {
    tip_firme: { type: String, required: true },
  },
  { collection: "tipovi_firmi" },
);

export const TipFirme = model<TipFirmeType>("TipFirme", tipFirmeSchema);
