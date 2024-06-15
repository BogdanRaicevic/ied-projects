import { Schema, model } from "mongoose";

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
  stecaj: string | null;
  likvidacija: string | null;
  blokada: string | null;
  odjava: string | null;
  created_at: Date | null;
  updated_at: Date;
  created_by: number | null;
  updated_by: number;
};

const firmaSchema = new Schema<FirmaType>();

const Firma = model<FirmaType>("Firma", firmaSchema);

export { FirmaType, Firma };
