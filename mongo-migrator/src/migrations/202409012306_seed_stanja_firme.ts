import type { Connection } from "mongoose";

export const up = async (db: Connection) => {
  const stanja = [
    { stanje_firme: "Ne znam" },
    { stanje_firme: "Aktivna" },
    { stanje_firme: "Likvidacija" },
    { stanje_firme: "Blokada" },
    { stanje_firme: "Stečaj" },
  ];

  const mongoCollectionName = "stanja_firme";

  try {
    const mongoCollection = db.collection(mongoCollectionName);
    (await mongoCollection).insertMany(stanja);
  } catch (error) {
    console.error("Error during migration:", error);
    throw error;
  }
};
