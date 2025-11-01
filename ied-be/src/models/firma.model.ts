import { type Document, model, Schema } from "mongoose";
import { type Zaposleni, zaposleniSchema } from "./zaposleni.model";

type FirmaType = Document & {
  ID_firma: number;
  naziv_firme: string;
  adresa: string;
  PIB: string;
  telefon: string;
  e_mail: string;
  faks: string;
  tip_firme: string;
  delatnost: string;
  ucesce_na_seminarima: number;
  FK_VELICINA_FIRME_ID_velicina_firme: number;
  FK_MESTO_ID_mesto: number;
  komentar: string;
  provereno: number;
  RB: number;
  created_at: Date | null;
  updated_at: Date;
  stanje_firme: string;
  zaposleni: Zaposleni[];
  mesto: string;
  velicina_firme: string;
  jbkjs: string;
  maticni_broj: string;
  prijavljeni: boolean;
};

const firmaSchema = new Schema<FirmaType>(
  {
    ID_firma: Number,
    naziv_firme: { type: String, required: true },
    adresa: String,
    PIB: String,
    telefon: String,
    e_mail: String,
    mesto: String,
    velicina_firme: String,
    faks: String,
    tip_firme: String,
    delatnost: String,
    ucesce_na_seminarima: Number,
    FK_VELICINA_FIRME_ID_velicina_firme: Number,
    FK_MESTO_ID_mesto: Number,
    komentar: String,
    provereno: Number,
    RB: Number,
    stanje_firme: String,
    zaposleni: { type: [zaposleniSchema], default: [] },
    jbkjs: String,
    maticni_broj: String,
    prijavljeni: { type: Boolean, default: true },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  },
);

const Firma = model<FirmaType>("Firma", firmaSchema);

export { type FirmaType, Firma };
