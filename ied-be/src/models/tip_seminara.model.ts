import { model, Schema, type Types } from "mongoose";

export type TipSeminaraType = {
  _id: Types.ObjectId;
  tipSeminara: string;
};

const tipSeminaraSchema = new Schema<TipSeminaraType>(
  {
    tipSeminara: { type: String, required: true, unique: true, trim: true },
  },
  { collection: "tipovi_seminara" },
);

export const TipSeminara = model<TipSeminaraType>(
  "TipSeminara",
  tipSeminaraSchema,
);
