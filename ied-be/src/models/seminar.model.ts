import { Document, type ObjectId, Schema, Types, model } from "mongoose";

export type SeminarType = Document & {
  naziv: string;
  predavac?: string;
  lokacija?: string;
  offlineCena?: string;
  onlineCena?: string;
  datum?: string | Date;
  prijave: PrijavaType[];
};

export type PrijavaType = {
  _id?: ObjectId;
  firma_id: string;
  firma_naziv: string;
  firma_email: string;
  firma_telefon: string;

  zaposleni_id: string;
  zaposleni_ime: string;
  zaposleni_prezime: string;
  zaposleni_email: string;
  zaposleni_telefon: string;
  // TODO: remove ne znam option after you are sure it is not used anywhere
  prisustvo: "online" | "offline" | "ne znam";
};

const prijavaSchema = new Schema<PrijavaType>({
  _id: { type: Types.ObjectId, default: () => new Types.ObjectId() },
  firma_id: { type: String, required: true },
  zaposleni_id: { type: String, required: true },
  firma_naziv: { type: String, required: true },
  firma_email: String,
  firma_telefon: String,
  zaposleni_ime: String,
  zaposleni_prezime: String,
  zaposleni_email: String,
  zaposleni_telefon: String,
  prisustvo: { type: String, enum: ["online", "offline", "ne znam"] },
});

const seminarSchema = new Schema<SeminarType>(
  {
    naziv: { type: String, required: true },
    predavac: { type: String, required: false },
    lokacija: { type: String, required: false },
    offlineCena: { type: String, required: false },
    onlineCena: { type: String, required: false },
    datum: { type: Schema.Types.Mixed, required: false },
    prijave: [prijavaSchema],
  },
  { collection: "seminari" }
);

export const Seminar = model<SeminarType>("Seminar", seminarSchema);

export { Types };
