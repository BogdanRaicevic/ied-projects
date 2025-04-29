import { Document, Schema, model } from "mongoose";

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
      naziv: { type: String, required: true },
      adresa: { type: String, required: false },
      pib: { type: String, required: false },
      maticniBroj: { type: String, required: false },
      mesto: { type: String, required: false },
    },
    seminar: {
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
    rokZaUplatu: { type: Number, default: 0, min: 0 },
    pozivNaBroj: {
      type: String,
      required: false,
    },
    stopaPdv: { type: Number, default: 20, required: true },
    dateCreatedAt: { type: Date, default: Date.now },
    dateUpdatedAt: { type: Date, default: Date.now },
  },
  { collection: "racuni" }
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
    const day = today.getDate().toString().padStart(2, "0"); // Day (01-31)
    const datePrefix = `${year}${month}${day}`; // e.g., "250428"

    // Find the last document created today with the same prefix
    const lastRacunToday = await model("Racun", racunSchema)
      .findOne({ pozivNaBroj: { $regex: `^${datePrefix}` } })
      .sort({ pozivNaBroj: -1 })
      .exec();

    let sequenceNumber = 1; // Default to 001
    if (lastRacunToday && lastRacunToday.pozivNaBroj) {
      // Extract the sequence part (last 4 digits) and increment
      const lastSequence = parseInt(lastRacunToday.pozivNaBroj.slice(-4), 10);
      sequenceNumber = lastSequence + 1;
    }

    const sequenceString = sequenceNumber.toString().padStart(4, "0");

    this.pozivNaBroj = `${datePrefix}${sequenceString}`;

    next();
  } catch (error: any) {
    console.error("Error generating pozivNaBroj:", error);
    next(error);
  }
});
// --- END OF PRE-SAVE HOOK ---

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
  pozivNaBroj: string;
};
