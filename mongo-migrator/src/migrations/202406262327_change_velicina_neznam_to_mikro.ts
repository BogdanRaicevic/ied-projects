import { mongoDbConnection } from "../config";

export const up = async () => {
  const mongoDb = await mongoDbConnection();
  const mongoCollectionName = "firmas";

  try {
    const mongoCollection = mongoDb.collection(mongoCollectionName);

    // Update documents where velicina is "neznam" to "Mikro"
    const updateResult = await mongoCollection.updateMany(
      { velicina: "neznam" },
      { $set: { velicina: "Mikro" } },
    );

    console.log(
      `Updated ${updateResult.modifiedCount} documents in the '${mongoCollectionName}' collection`,
    );
  } catch (error) {
    console.error("Error during migration:", error);
    throw error;
  }
};
