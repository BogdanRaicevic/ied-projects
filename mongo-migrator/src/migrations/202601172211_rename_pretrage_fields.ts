import type { Connection } from "mongoose";

export const up = async (db: Connection) => {
  const mongoCollectionName = "pretrage";

  try {
    const mongoCollection = db.collection(mongoCollectionName);

    await mongoCollection.updateMany(
      {},
      {
        $rename: {
          naziv_pretrage: "nazivPretrage",
          tipovi_firme: "tipoviFirme",
          radna_mesta: "radnaMesta",
          velicine_firme: "velicineFirme",
          stanja_firme: "stanjaFirme",
          maticni_broj: "maticniBroj",
          ime_firme: "imeFirme",
        },
      },
    );
  } catch (error) {
    console.error("Error during migration of seed seminar types:", error);
    throw error;
  }
};
