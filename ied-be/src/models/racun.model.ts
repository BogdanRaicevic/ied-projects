import { Document, Schema, model } from "mongoose";
import { SequenceModel } from "./sequence.model";

const racunSchema = new Schema(
  {
    izdavacRacuna: {
      type: String,
      enum: ["ied", "permanent", "bs"],
      required: true,
      index: true,
    },
    tipRacuna: {
      type: String,
      enum: ["predracun", "racun", "avansniRacun", "konacniRacun"],
      required: true,
    },
    tekuciRacun: {
      type: String,
      required: true,
    },
    primalacRacuna: {
      firma_id: { type: Schema.Types.ObjectId, ref: "Firma" },
      naziv: { type: String, required: true },
      adresa: { type: String, required: false },
      pib: { type: String, required: false },
      maticniBroj: { type: String, required: false },
      mesto: { type: String, required: false },
    },
    seminar: {
      seminar_id: { type: Schema.Types.ObjectId, ref: "Seminar" },
      naziv: { type: String, required: true },
      datum: { type: Date, required: true },
      lokacija: { type: String, required: false },
      jedinicaMere: { type: String, required: false },
      brojUcesnikaOnline: { type: Number, default: 0, min: 0 },
      brojUcesnikaOffline: { type: Number, default: 0, min: 0 },
      onlineCena: { type: Number, default: 0, min: 0 },
      offlineCena: { type: Number, default: 0, min: 0 },
      popustOnline: { type: Number, default: 0, min: 0, max: 100 },
      popustOffline: { type: Number, default: 0, min: 0, max: 100 },
      avansBezPdv: { type: Number, default: 0, min: 0 },
    },
    calculations: {
      onlineUkupnaNaknada: { type: Number, default: 0, min: 0 },
      offlineUkupnaNaknada: { type: Number, default: 0, min: 0 },
      onlinePoreskaOsnovica: { type: Number, default: 0, min: 0 },
      offlinePoreskaOsnovica: { type: Number, default: 0, min: 0 },
      pdvOnline: { type: Number, default: 0, min: 0 },
      pdvOffline: { type: Number, default: 0, min: 0 },
      avansPdv: { type: Number, default: 0, min: 0 },
      avans: { type: Number, default: 0, min: 0 },
      ukupnaNaknada: { type: Number, default: 0, min: 0 },
      ukupanPdv: { type: Number, default: 0, min: 0 },
    },
    datumUplateAvansa: { type: Date, required: false, default: new Date() },
    rokZaUplatu: { type: Number, default: 0, min: 0 },
    pozivNaBroj: {
      type: String,
      required: false,
    },
    placeno: { type: Number, default: 0, min: 0 },
    stopaPdv: { type: Number, default: 20, required: true },
    linkedPozivNaBroj: { type: String, required: false },
    dateCreatedAt: { type: Date, default: Date.now, immutable: true },
  },
  {
    collection: "racuni",
    timestamps: { createdAt: "dateCreatedAt", updatedAt: "dateUpdatedAt" },
  }
);

// --- COMPOUND UNIQUE INDEX ---
racunSchema.index({ izdavacRacuna: 1, pozivNaBroj: 1 }, { unique: true });

// --- PRE-SAVE HOOK FOR pozivNaBroj ---
racunSchema.pre("save", async function (next) {
  // Only run for new documents
  if (!this.isNew) {
    return next();
  }

  try {
    const today = new Date();
    const year = today.getFullYear().toString().slice(-2); // Last 2 digits of year
    const month = (today.getMonth() + 1).toString().padStart(2, "0"); // Month (01-12)
    const datePrefix = `${year}${month}`; // e.g., "2504"

    const sequenceDoc = await SequenceModel.findOneAndUpdate(
      { _id: datePrefix },
      { $inc: { sequenceNumber: 1 } },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    ).exec();

    const sequenceNumber = sequenceDoc ? sequenceDoc.sequenceNumber : 1;

    this.pozivNaBroj = `${datePrefix}${sequenceNumber}`;

    next();
  } catch (error: any) {
    console.error("Error generating pozivNaBroj:", error);
    next(error);
  }
});
// --- END OF PRE-SAVE HOOK ---

export const RacunModel = model("Racun", racunSchema);

export type RacunModel = Document & {
  izdavacRacuna: "ied" | "permanent" | "bs";
  tipRacuna: "predracun" | "racun" | "avansniRacun" | "konacniRacun";
  tekuciRacun: string;
  primalacRacuna: {
    firma_id: string;
    naziv: string;
    adresa: string;
    pib: number;
    maticniBroj: number;
    mesto: string;
  };
  seminar: {
    seminar_id: string;
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
  datumUplateAvansa: Date;
  rokZaUplatu: number;
  pozivNaBroj: string;
  linkedPozivNaBroj: string;
  placeno: number;
};
