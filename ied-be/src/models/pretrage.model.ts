import { Schema, Types, model } from "mongoose";

export type PretrageType = Document & {
  naziv_pretrage: string;
  mesta: string[];
  delatnosti: string[];
  tipovi_firme: string[];
  radna_mesta: string[];
  velicine_firme: string[];
  negacije: string[];
  ime_firme: string;
  email: string;
  pib: string;
  stanja_firme: string[];
  jbkjs: string;
};

const pretrageSchema = new Schema<PretrageType>(
  {
    naziv_pretrage: { type: String, required: true },
    mesta: [{ type: String, ref: "Mesto" }],
    delatnosti: [{ type: String, ref: "Delatnost" }],
    tipovi_firme: [{ type: String, ref: "TipFirme" }],
    radna_mesta: [{ type: String, ref: "RadnaMesta" }],
    velicine_firme: [{ type: String, ref: "VelicineFirmi" }],
    negacije: [{ type: String }],
    ime_firme: { type: String },
    email: { type: String },
    pib: { type: String },
    stanja_firme: [{ type: String, ref: "StanjeFirme" }],
    jbkjs: { type: String },
  },
  { collection: "pretrage" }
);

export const Pretrage = model<PretrageType>("Pretrage", pretrageSchema);
