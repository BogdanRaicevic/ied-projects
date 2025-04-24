import { Document, Schema, model } from "mongoose";

const racunSchema = new Schema(
  {
    izdavacRacuna: {
      type: String,
      enum: ["ied", "permanent", "bs"],
      required: true,
    },
    tipRacuna: {
      type: String,
      enum: ["predracun", "racun", "avansniRacun", "konacniRacun"],
      required: false,
    },
    tekuciRacun: {
      type: String,
      required: false,
    },
    primalacRacuna: {
      naziv: { type: String, required: false },
      adresa: { type: String, required: false },
      pib: { type: String, required: false },
      maticniBroj: { type: String, required: false },
      mesto: { type: String, required: false },
    },
    seminar: {
      naziv: { type: String, required: false },
      datum: { type: Date, required: false },
      lokacija: { type: String, required: false },
      jedinicaMere: { type: String, required: false },
      brojUcesnikaOnline: { type: Number, default: 0 },
      brojUcesnikaOffline: { type: Number, default: 0 },
      onlineCena: { type: Number, default: 0 },
      offlineCena: { type: Number, default: 0 },
      popustOnline: { type: Number, default: 0 },
      popustOffline: { type: Number, default: 0 },
      avansBezPdv: { type: Number, default: 0 },
    },
    calculations: {
      onlineUkupnaNaknada: { type: Number, default: 0 },
      offlineUkupnaNaknada: { type: Number, default: 0 },
      onlinePoreskaOsnovica: { type: Number, default: 0 },
      offlinePoreskaOsnovica: { type: Number, default: 0 },
      pdvOnline: { type: Number, default: 0 },
      pdvOffline: { type: Number, default: 0 },
      avansPdv: { type: Number, default: 0 },
      avans: { type: Number, default: 0 },
      ukupnaNaknada: { type: Number, default: 0 },
      ukupanPdv: { type: Number, default: 0 },
    },
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

export const Racun = model("Racun", racunSchema);

export type Racun = Document & {
  izdavacRacuna: "ied" | "permanent" | "bs";
  tipRacuna: "predracun" | "racun" | "avansniRacun" | "konacniRacun";
  tekuciRacun: string;
  primalacRacuna: {
    naziv: string;
    adresa: string;
    pib: number;
    maticniBroj: number;
    mesto: string;
  };
  seminar: {
    naziv: string;
    datum: Date;
    lokacija: string;
    jedinicaMere: string;
    brojUcesnikaOnline: number;
    brojUcesnikaOffline: number;
    onlineCena: number;
    offlineCena: number;
    popustOnline: number;
    popustOffline: number;
    avansBezPdv: number;
  };
  calculations: {
    onlineUkupnaNaknada: number;
    offlineUkupnaNaknada: number;
    onlinePoreskaOsnovica: number;
    offlinePoreskaOsnovica: number;
    pdvOnline: number;
    pdvOffline: number;
    avansPdv: number;
    avans: number;
    ukupnaNaknada: number;
    ukupanPdv: number;
  };
  rokZaUplatu: number;
  pozivNaBroj: number;
};
