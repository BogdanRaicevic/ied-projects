import { Schema, model } from "mongoose";

export type SeminarType = Document & {
  naziv: string;
  predavac?: string;
  lokacija?: string;
  offlineCena?: string;
  onlineCena?: string;
  datum?: string;
  prijave: PrijaveType[];
};

type PrijaveType = {
  id_firme: string;
  id_zaposlenog: string;
  naziv_firme: string;
  email_firme: string;
  telefon_firme: string;
  ime_zaposlenog: string;
  prezime_zaposlenog: string;
  email_zaposlenog: string;
  telefon_zaposlenog: string;
  prisustvo: "online" | "offline";
};

const prijaveSchema = new Schema<PrijaveType>({
  id_firme: { type: String, required: true },
  id_zaposlenog: { type: String, required: true },
  naziv_firme: { type: String, required: true },
  email_firme: String,
  telefon_firme: String,
  ime_zaposlenog: String,
  prezime_zaposlenog: String,
  email_zaposlenog: String,
  telefon_zaposlenog: String,
  prisustvo: { type: String, enum: ["online", "offline"] },
});

const seminarSchema = new Schema<SeminarType>(
  {
    naziv: { type: String, required: true },
    predavac: { type: String, required: false },
    lokacija: { type: String, required: false },
    offlineCena: { type: String, required: false },
    onlineCena: { type: String, required: false },
    datum: { type: String, required: false },
    prijave: [prijaveSchema],
  },
  { collection: "seminari" }
);

export const Seminar = model<SeminarType>("Seminar", seminarSchema);
