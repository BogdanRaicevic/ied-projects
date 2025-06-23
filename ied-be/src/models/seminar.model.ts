import { Document, Schema, Types, model } from "mongoose";

export type SeminarType = Document & {
  naziv: string;
  predavac?: string;
  lokacija?: string;
  offlineCena?: number;
  onlineCena?: number;
  datum?: Date;
  detalji?: string;
  prijave: PrijavaType[];
};

export type PrijavaType = {
  _id?: Types.ObjectId;
  firma_id: Types.ObjectId;
  firma_naziv: string;
  firma_email: string;
  firma_telefon: string;

  zaposleni_id: Types.ObjectId;
  zaposleni_ime: string;
  zaposleni_prezime: string;
  zaposleni_email: string;
  zaposleni_telefon: string;
  prisustvo: "online" | "offline";
};

const prijavaSchema = new Schema<PrijavaType>({
  _id: { type: Schema.Types.ObjectId, default: () => new Types.ObjectId() },
  firma_id: { type: Schema.Types.ObjectId, required: true },
  zaposleni_id: { type: Schema.Types.ObjectId, required: true },
  firma_naziv: { type: String, required: true },
  firma_email: String,
  firma_telefon: String,
  zaposleni_ime: String,
  zaposleni_prezime: String,
  zaposleni_email: String,
  zaposleni_telefon: String,
  prisustvo: { type: String, enum: ["online", "offline"] },
});

const seminarSchema = new Schema<SeminarType>(
  {
    naziv: { type: String, required: true },
    predavac: { type: String, required: false },
    lokacija: { type: String, required: false },
    offlineCena: { type: Number, required: false },
    onlineCena: { type: Number, required: false },
    datum: { type: Date, required: false },
    detalji: { type: String, required: false },
    prijave: [prijavaSchema],
  },
  { collection: "seminari" },
);

export const Seminar = model<SeminarType>("Seminar", seminarSchema);
