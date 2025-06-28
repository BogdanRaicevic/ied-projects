import { mongoDbConnection } from "../config";

export const up = async () => {
  const mongoDb = await mongoDbConnection();
  const collectionsToUpdate = ["firmas", "velicine_firmi"];

  try {
    for (const collectionName of collectionsToUpdate) {
      const mongoCollection = mongoDb.collection(collectionName);
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
