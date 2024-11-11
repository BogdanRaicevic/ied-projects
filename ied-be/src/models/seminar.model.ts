import { Schema, model } from "mongoose";

export type SeminarType = Document & {
  naziv: string;
  predavac: string;
  lokacija: string;
};

const seminarSchema = new Schema<SeminarType>(
  {
    naziv: { type: String, required: true },
    predavac: { type: String, required: true },
    lokacija: { type: String, required: true },
  },
  { collection: "seminari" }
);

export const Seminar = model<SeminarType>("Seminar", seminarSchema);
