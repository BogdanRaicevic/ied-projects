import type { Connection } from "mongoose";

export const up = async (db: Connection) => {
  const collectionsToUpdate = ["firmas", "velicine_firmi"];

  try {
    for (const collectionName of collectionsToUpdate) {
      const mongoCollection = db.collection(collectionName);
      const cursor = mongoCollection.find();

      while (await cursor.hasNext()) {
        const document = await cursor.next();

        if (document?.velicina !== undefined) {
          await mongoCollection.updateOne(
            { _id: document._id },
            { $rename: { velicina: "velicina_firme" } },
          );
        }
      }
    }
  } catch (error) {
    console.error("Error during migration of fix bad emails:", error);
    throw error;
  }
};
