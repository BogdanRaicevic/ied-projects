import { IzdavacRacuna, type IzdavacType } from "ied-shared";
import { model, Schema } from "mongoose";

const izdavacSchema = new Schema<IzdavacType>(
  {
    sifra: {
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
  // No `id` virtual: the business key is `sifra`, Mongo's key is `_id`.
  { collection: "izdavaci", id: false },
);

export const Izdavac = model<IzdavacType>("Izdavac", izdavacSchema);
