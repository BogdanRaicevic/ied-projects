import { type Document, model, Schema, Types } from "mongoose";
import { SequenceModel } from "./sequence.model";

const racunBaseSchema = new Schema(
  {
    izdavacRacuna: {
      type: String,
      enum: ["ied", "permanent", "bs"],
      required: true,
      index: true,
      immutable: true,
    },
    tipRacuna: {
      type: String,
      enum: ["predracun", "racun", "avansniRacun", "konacniRacun"],
      required: true,
      immutable: true,
    },
    tekuciRacun: {
      type: String,
      required: true,
    },
    primalacRacuna: {
      firma_id: { type: Types.ObjectId, ref: "Firma" },
      naziv: { type: String, required: true },
      adresa: { type: String, required: false },
      pib: { type: String, required: false },
      maticniBroj: { type: String, required: false },
      mesto: { type: String, required: false },
    },
    seminar: {
      seminar_id: { type: Types.ObjectId, ref: "Seminar" },
      naziv: { type: String, required: true },
      datum: { type: Date, required: true },
      lokacija: { type: String, required: false },
      jedinicaMere: { type: String, required: false },
      onlineCena: { type: Number, default: 0, min: 0 },
      offlineCena: { type: Number, default: 0, min: 0 },
      brojUcesnikaOnline: { type: Number, default: 0, min: 0 },
      brojUcesnikaOffline: { type: Number, default: 0, min: 0 },
    },
    pozivNaBroj: {
      type: String,
      required: false,
    },
    stopaPdv: { type: Number, default: 20, required: true },
  },
  {
    collection: "racuni",
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  },
);

// --- COMPOUND UNIQUE INDEX ---
racunBaseSchema.index(
  { izdavacRacuna: 1, tipRacuna: 1, pozivNaBroj: 1 },
  { unique: true },
);

// --- PRE-SAVE HOOK FOR pozivNaBroj ---
racunBaseSchema.pre("save", async function () {
  // Only run for new documents
  if (!this.isNew || this.pozivNaBroj) {
    return;
  }

  try {
    const today = new Date();
    const year = today.getFullYear().toString().slice(-2); // Last 2 digits of year
    const month = (today.getMonth() + 1).toString().padStart(2, "0"); // Month (01-12)
    const datePrefix = `${year}${month}`; // e.g., "2504"

    const sequenceDoc = await SequenceModel.findOneAndUpdate(
      { _id: `${this.izdavacRacuna}_${this.tipRacuna}_${datePrefix}` },
      { $inc: { sequenceNumber: 1 } },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      },
    ).exec();

    const sequenceNumber = sequenceDoc ? sequenceDoc.sequenceNumber : 1;
    const sequenceNumberPadded = sequenceNumber.toString().padStart(4, "0");

    this.set("pozivNaBroj", `${datePrefix}${sequenceNumberPadded}`);
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("Error generating pozivNaBroj:", err.message);
    throw err;
  }
});
// --- END OF PRE-SAVE HOOK ---

export const RacunBaseModel = model("Racun", racunBaseSchema);

RacunBaseModel.discriminator(
  "predracun",
  new Schema({
    calculations: {
      onlineUkupnaNaknada: { type: Number, default: 0, min: 0 },
      offlineUkupnaNaknada: { type: Number, default: 0, min: 0 },
      onlinePoreskaOsnovica: { type: Number, default: 0, min: 0 },
      offlinePoreskaOsnovica: { type: Number, default: 0, min: 0 },
      popustOnline: { type: Number, default: 0, min: 0, max: 100 },
      popustOffline: { type: Number, default: 0, min: 0, max: 100 },
      pdvOnline: { type: Number, default: 0, min: 0 },
      pdvOffline: { type: Number, default: 0, min: 0 },
      ukupnaNaknada: { type: Number, default: 0, min: 0 },
      ukupanPdv: { type: Number, default: 0, min: 0 },
    },
    rokZaUplatu: { type: Number, default: 0, min: 0 },
  }),
);

RacunBaseModel.discriminator(
  "avansniRacun",
  new Schema({
    calculations: {
      avansBezPdv: { type: Number, default: 0, min: 0 },
      avansPdv: { type: Number, default: 0, min: 0 },
      avans: { type: Number, default: 0, min: 0 },
    },
    datumUplateAvansa: { type: Date, required: false, default: Date.now },
  }),
);

RacunBaseModel.discriminator(
  "konacniRacun",
  new Schema({
    calculations: {
      onlineUkupnaNaknada: { type: Number, default: 0, min: 0 },
      offlineUkupnaNaknada: { type: Number, default: 0, min: 0 },
      onlinePoreskaOsnovica: { type: Number, default: 0, min: 0 },
      offlinePoreskaOsnovica: { type: Number, default: 0, min: 0 },
      popustOnline: { type: Number, default: 0, min: 0, max: 100 },
      popustOffline: { type: Number, default: 0, min: 0, max: 100 },
      pdvOnline: { type: Number, default: 0, min: 0 },
      pdvOffline: { type: Number, default: 0, min: 0 },
      ukupnaNaknada: { type: Number, default: 0, min: 0 },
      ukupanPdv: { type: Number, default: 0, min: 0 },
      avansBezPdv: { type: Number, default: 0, min: 0 },
      avansPdv: { type: Number, default: 0, min: 0 },
      avans: { type: Number, default: 0, min: 0 },
    },
    linkedPozivNaBroj: { type: String, required: true },
  }),
);

RacunBaseModel.discriminator(
  "racun",
  new Schema({
    calculations: {
      onlineUkupnaNaknada: { type: Number, default: 0, min: 0 },
      offlineUkupnaNaknada: { type: Number, default: 0, min: 0 },
      onlinePoreskaOsnovica: { type: Number, default: 0, min: 0 },
      offlinePoreskaOsnovica: { type: Number, default: 0, min: 0 },
      popustOnline: { type: Number, default: 0, min: 0, max: 100 },
      popustOffline: { type: Number, default: 0, min: 0, max: 100 },
      pdvOnline: { type: Number, default: 0, min: 0 },
      pdvOffline: { type: Number, default: 0, min: 0 },
      ukupnaNaknada: { type: Number, default: 0, min: 0 },
      ukupanPdv: { type: Number, default: 0, min: 0 },
      placeno: { type: Number, default: 0, min: 0 },
    },
  }),
);

export type RacunBaseType = Document & {
  izdavacRacuna: "ied" | "permanent" | "bs";
  tipRacuna: "predracun" | "racun" | "avansniRacun" | "konacniRacun";
  tekuciRacun: string;
  primalacRacuna: {
    firma_id: Types.ObjectId;
    naziv: string;
    adresa: string;
    pib: string;
    maticniBroj: string;
    mesto: string;
  };
  seminar: {
    seminar_id: Types.ObjectId;
    naziv: string;
    datum: Date;
    lokacija: string;
    jedinicaMere: string;
    brojUcesnikaOnline: number;
    brojUcesnikaOffline: number;
    onlineCena: number;
    offlineCena: number;
  };
  pozivNaBroj: string;
};

export type PredracunModel = RacunBaseType & {
  calculations: {
    onlineUkupnaNaknada: number;
    offlineUkupnaNaknada: number;
    onlinePoreskaOsnovica: number;
    offlinePoreskaOsnovica: number;
    popustOnline: number;
    popustOffline: number;
    pdvOnline: number;
    pdvOffline: number;
    ukupnaNaknada: number;
    ukupanPdv: number;
  };
  rokZaUplatu: number;
};

export type AvansniRacunModel = RacunBaseType & {
  calculations: {
    avansBezPdv: number;
    avansPdv: number;
    avans: number;
  };
  datumUplateAvansa: Date;
};

export type KonacniRacunModel = RacunBaseType & {
  calculations: {
    onlineUkupnaNaknada: number;
    offlineUkupnaNaknada: number;
    onlinePoreskaOsnovica: number;
    offlinePoreskaOsnovica: number;
    popustOnline: number;
    popustOffline: number;
    pdvOnline: number;
    pdvOffline: number;
    ukupnaNaknada: number;
    ukupanPdv: number;
    avansBezPdv: number;
    avansPdv: number;
    avans: number;
  };
  linkedPozivNaBroj: string;
};

export type RacunModel = RacunBaseType & {
  calculations: {
    onlineUkupnaNaknada: number;
    offlineUkupnaNaknada: number;
    onlinePoreskaOsnovica: number;
    offlinePoreskaOsnovica: number;
    popustOnline: number;
    popustOffline: number;
    pdvOnline: number;
    pdvOffline: number;
    ukupnaNaknada: number;
    ukupanPdv: number;
    placeno: number;
  };
};

export type AllRacuni =
  | PredracunModel
  | AvansniRacunModel
  | KonacniRacunModel
  | RacunModel;
