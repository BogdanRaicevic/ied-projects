import { Document, Schema, model } from "mongoose";

const racunSchema = new Schema(
  {
    izdavacRacuna: {
      naziv: { type: String, required: true },
      kontaktTelefoni: { type: [String], required: true },
      pib: { type: String, required: true },
      maticniBroj: { type: String, required: true },
      adresa: { type: String, required: true },
      mesto: { type: String, required: true },
      brojResenjaOEvidencijiZaPdv: { type: String, required: true },
      tekuciRacun: { type: String, required: true },
    },
    tipRacuna: {
      type: String,
      enum: ["predracun", "racun", "avansniRacun", "konacniRacun"],
      required: true,
    },
    primalacRacuna: {
      naziv: { type: String, required: true },
      adresa: { type: String, required: true },
      pib: { type: String, required: true },
      maticniBroj: { type: String, required: true },
      mesto: { type: String, required: true },
    },
    nazivSeminara: { type: String, required: true },
    datumOdrzavanjaSeminara: { type: Date, required: true },
    datumPrometaUsluge: { type: Date, required: true },
    jedinicaMere: { type: String, required: true },
    brojUcesnikaOnline: { type: Number, default: 0 },
    brojUcesnikaOffline: { type: Number, default: 0 },
    onlineCena: { type: Number, default: 0 },
    offlineCena: { type: Number, default: 0 },
    popustOnline: { type: Number, default: 0 },
    popustOffline: { type: Number, default: 0 },
    stopaPdv: { type: Number, required: true },
    onlineUkupnaNaknada: { type: Number, default: 0 },
    offlineUkupnaNaknada: { type: Number, default: 0 },
    onlinePoreskaOsnovica: { type: Number, default: 0 },
    offlinePoreskaOsnovica: { type: Number, default: 0 },
    avansPdv: { type: Number, default: 0 },
    avans: { type: Number, default: 0 },
    ukupnaNaknada: { type: Number, default: 0 },
    ukupanPdv: { type: Number, default: 0 },
    rokZaUplatu: { type: Number, required: true },
    pozivNaBroj: {
      type: Number,
      required: true,
      unique: true,
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
    pib: string;
    maticniBroj: string;
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
