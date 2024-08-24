import { Schema, Types, model } from "mongoose";

export type PretrageType = Document & {
  naziv_pretrage: string;
  mesta: Types.ObjectId[];
  delatnosti: Types.ObjectId[];
  tipovi_firme: Types.ObjectId[];
  radna_mesta: Types.ObjectId[];
  velicine_firme: Types.ObjectId[];
};

const pretrageSchema = new Schema<PretrageType>(
  {
    naziv_pretrage: { type: String, required: true },
    mesta: [{ type: Schema.Types.ObjectId, ref: "Mesto" }],
    delatnosti: [{ type: Schema.Types.ObjectId, ref: "Delatnost" }],
    tipovi_firme: [{ type: Schema.Types.ObjectId, ref: "TipFirme" }],
    radna_mesta: [{ type: Schema.Types.ObjectId, ref: "RadnaMesta" }],
    velicine_firme: [{ type: Schema.Types.ObjectId, ref: "VelicineFirmi" }],
  },
  { collection: "pretrage" }
);

export const Pretrage = model<PretrageType>("Pretrage", pretrageSchema);
