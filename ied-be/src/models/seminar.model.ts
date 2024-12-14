import { Schema, model } from "mongoose";

export type SeminarType = Document & {
  naziv: string;
  predavac?: string;
  lokacija?: string;
  offlineCena?: string;
  onlineCena?: string;
  datum?: string;
};

const seminarSchema = new Schema<SeminarType>(
  {
    naziv: { type: String, required: true },
    predavac: { type: String, required: false },
    lokacija: { type: String, required: false },
    offlineCena: { type: String, required: false },
    onlineCena: { type: String, required: false },
    datum: { type: String, required: false },
  },
  { collection: "seminari" }
);

export const Seminar = model<SeminarType>("Seminar", seminarSchema);
