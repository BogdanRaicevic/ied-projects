import { Schema, model } from "mongoose";
import { Zaposleni, zaposleniSchema } from "./zaposleni.model";

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
  created_by: number | null;
  updated_by: number;
  stanje_firme: string;
  zaposleni: Zaposleni[];
  postanski_broj: string;
  mesto: string;
  velicina_firme: string;
};

const firmaSchema = new Schema<FirmaType>({
  ID_firma: Number,
  naziv_firme: String,
  adresa: String,
  PIB: String,
  telefon: String,
  e_mail: String,
  mesto: String,
  velicina_firme: String,
  postanski_broj: String,
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
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  created_by: { type: Number, default: null },
  updated_by: Number,
  zaposleni: [zaposleniSchema],
});

const Firma = model<FirmaType>("Firma", firmaSchema);

export { FirmaType, Firma };
