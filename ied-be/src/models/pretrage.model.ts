import { type Document, model, Schema } from "mongoose";

export type PretrageType = Document & {
  nazivPretrage: string;
  mesta: string[];
  delatnosti: string[];
  tipoviFirme: string[];
  radnaMesta: string[];
  velicineFirme: string[];
  negacije: string[];
  imeFirme: string;
  email: string;
  pib: string;
  stanjaFirme: string[];
  jbkjs: string;
  maticniBroj: string;
  komentar: string;
  imePrezime: string;
  emailZaposlenog: string;
  firmaPrijavljeni?: boolean;
  zaposleniPrijavljeni?: boolean;
  tipoviSeminara: string[];
  seminari: string[];
};

const pretrageSchema = new Schema<PretrageType>(
  {
    nazivPretrage: { type: String, required: true },
    mesta: [{ type: String, ref: "Mesto" }],
    delatnosti: [{ type: String, ref: "Delatnost" }],
    tipoviFirme: [{ type: String, ref: "TipFirme" }],
    radnaMesta: [{ type: String, ref: "RadnaMesta" }],
    velicineFirme: [{ type: String, ref: "VelicineFirmi" }],
    negacije: [{ type: String }], // TODO: vezati za enum negacije
    imeFirme: { type: String },
    email: { type: String },
    pib: { type: String },
    stanjaFirme: [{ type: String, ref: "StanjeFirme" }],
    jbkjs: { type: String },
    maticniBroj: { type: String },
    komentar: { type: String },
    imePrezime: { type: String },
    emailZaposlenog: { type: String },
    firmaPrijavljeni: { type: Boolean },
    zaposleniPrijavljeni: { type: Boolean },
    tipoviSeminara: [{ type: String, ref: "TipSeminara" }],
    seminari: [{ type: String, ref: "Seminar" }],
  },
  { collection: "pretrage" },
);

export const Pretrage = model<PretrageType>("Pretrage", pretrageSchema);
