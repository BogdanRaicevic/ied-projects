import { model, Schema, type Types } from "mongoose";

export type TipFirmeType = {
  _id: Types.ObjectId;
  tip_firme: string;
};

const tipFirmeSchema = new Schema<TipFirmeType>(
  {
    tip_firme: { type: String, required: true },
  },
  { collection: "tipovi_firmi" },
);

export const TipFirme = model<TipFirmeType>("TipFirme", tipFirmeSchema);
