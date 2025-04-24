import { Document, Schema, model } from "mongoose";

const racunSchema = new Schema(
  {
    izdavacRacuna: {
      naziv: { type: String, required: false },
      kontaktTelefoni: { type: [String], required: false },
      pib: { type: String, required: false },
      maticniBroj: { type: String, required: false },
      // TODO: Zasto imam i Adresu i mesto?
      adresa: { type: String, required: false },
      mesto: { type: String, required: false },
      brojResenjaOEvidencijiZaPdv: { type: String, required: false },
      tekuciRacun: { type: String, required: false },
    },
    tipRacuna: {
      type: String,
      enum: ["predracun", "racun", "avansniRacun", "konacniRacun"],
      required: false,
    },
    primalacRacuna: {
      naziv: { type: String, required: false },
      adresa: { type: String, required: false },
      pib: { type: String, required: false },
      maticniBroj: { type: String, required: false },
      mesto: { type: String, required: false },
    },
    nazivSeminara: { type: String, required: false },
    datumOdrzavanjaSeminara: { type: Date, required: false },
    datumPrometaUsluge: { type: Date, required: false },
    jedinicaMere: { type: String, required: false },
    brojUcesnikaOnline: { type: Number, default: 0 },
    brojUcesnikaOffline: { type: Number, default: 0 },
    onlineCena: { type: Number, default: 0 },
    offlineCena: { type: Number, default: 0 },
    popustOnline: { type: Number, default: 0 },
    popustOffline: { type: Number, default: 0 },
    stopaPdv: { type: Number, required: false },
    onlineUkupnaNaknada: { type: Number, default: 0 },
    offlineUkupnaNaknada: { type: Number, default: 0 },
    onlinePoreskaOsnovica: { type: Number, default: 0 },
    offlinePoreskaOsnovica: { type: Number, default: 0 },
    avansPdv: { type: Number, default: 0 },
    avans: { type: Number, default: 0 },
    ukupnaNaknada: { type: Number, default: 0 },
    ukupanPdv: { type: Number, default: 0 },
    rokZaUplatu: { type: Number, required: false },
    pozivNaBroj: {
      type: Number,
      required: false,
      unique: false,
    },
    dateCreatedAt: { type: Date, default: Date.now },
    dateUpdatedAt: { type: Date, default: Date.now },
  },
  { collection: "racuni" }
);

// Create and export the Racun model
export const Racun = model("Racun", racunSchema);

export type Racun = Document & {
  izdavacRacuna: {
    naziv: string;
    kontaktTelefoni: string[];
    pib: number;
    maticniBroj: number;
    adresa: string;
    mesto: string;
    brojResenjaOEvidencijiZaPdv: string;
    tekuciRacun: string;
  };
  tipRacuna: "predracun" | "racun" | "avansniRacun" | "konacniRacun";
  primalacRacuna: {
    naziv: string;
    adresa: string;
    pib: number;
    maticniBroj: number;
    mesto: string;
  };
  nazivSeminara: string;
  datumOdrzavanjaSeminara: Date;
  datumPrometaUsluge: Date;
  jedinicaMere: string;
  brojUcesnikaOnline: number;
  brojUcesnikaOffline: number;
  onlineCena: number;
  offlineCena: number;
  popustOnline: number;
  popustOffline: number;
  stopaPdv: number;
  onlineUkupnaNaknada: number;
  offlineUkupnaNaknada: number;
  onlinePoreskaOsnovica: number;
  offlinePoreskaOsnovica: number;
  avansPdv: number;
  avans: number;
  ukupnaNaknada: number;
  ukupanPdv: number;
  rokZaUplatu: number;
  pozivNaBroj: number;
  dateCreatedAt: Date;
  dateUpdatedAt: Date;
};
