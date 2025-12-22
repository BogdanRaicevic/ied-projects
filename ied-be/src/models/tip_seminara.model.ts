import { type Document, model, Schema } from "mongoose";

type TipSeminaraType = Document & {
  tipSeminara: string;
};

const tipSeminaraSchema = new Schema<TipSeminaraType>(
  {
    tipSeminara: { type: String, required: true },
  },
  { collection: "tipovi_seminara" },
);

export const TipSeminara = model<TipSeminaraType>(
  "TipSeminara",
  tipSeminaraSchema,
);
