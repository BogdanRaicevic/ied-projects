import { Schema, model } from "mongoose";

export type SeminarType = Document & {
  naziv: string;
  predavac: string;
  lokacija: string;
};

const seminarSchema = new Schema<SeminarType>(
  {
    naziv: { type: String, required: true },
    predavac: { type: String, required: false },
    lokacija: { type: String, required: false },
  },
  { collection: "seminari" }
);

export const Seminar = model<SeminarType>("Seminar", seminarSchema);
