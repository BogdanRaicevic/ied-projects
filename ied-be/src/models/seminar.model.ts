import { Schema, model } from "mongoose";

export type SeminariType = Document & {
  naziv: string;
  predavac: string;
  lokacija: string;
};

const seminariSchema = new Schema<SeminariType>(
  {
    naziv: { type: String, required: true },
    predavac: { type: String, required: true },
    lokacija: { type: String, required: true },
  },
  { collection: "seminari" }
);

export const Seminari = model<SeminariType>("Seminari", seminariSchema);
