import { IzdavacRacuna, type IzdavacType } from "ied-shared";
import { model, Schema } from "mongoose";

const izdavacSchema = new Schema<IzdavacType>(
  {
    id: {
      type: String,
      enum: Object.values(IzdavacRacuna),
      required: true,
      unique: true,
    },
    naziv: { type: String, required: true },
    kontaktTelefoni: { type: [String], default: [] },
    pib: { type: Number, required: true },
    maticniBroj: { type: Number, required: true },
    brojResenjaOEvidencijiZaPDV: { type: String },
    tekuciRacuni: { type: [String], default: [] },
    pdvObveznik: { type: Boolean, required: true },
  },
  { collection: "izdavaci" },
);

export const Izdavac = model<IzdavacType>("Izdavac", izdavacSchema);
