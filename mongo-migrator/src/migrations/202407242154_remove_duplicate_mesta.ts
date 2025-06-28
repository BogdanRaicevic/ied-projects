import type { AnyObject, Collection } from "mongoose";
import { mongoDbConnection } from "../config";

export const up = async () => {
  const mongoDb = await mongoDbConnection();
  const mongoCollectionName = "mesta";

  try {
    const mongoCollection = mongoDb.collection(mongoCollectionName);

    await findDuplicates(mongoCollection);
    await removeDuplicates(mongoCollection);
  } catch (error) {
    console.error("Error during migration:", error);
    throw error;
  }
};

const removeDuplicates = async (mongoCollection: Collection<AnyObject>) => {
  const duplicates = await findDuplicates(mongoCollection);

  for (const duplicate of duplicates) {
    // Keep the first document and remove the rest
    const [keep, ...remove] = duplicate.docs;

    await mongoCollection.deleteMany({ _id: { $in: remove } });
  }
};

const findDuplicates = async (mongoCollection: Collection<AnyObject>) => {
  const duplicates = await mongoCollection
    .aggregate([
      {
        $group: {
          _id: "$naziv_mesto",
          count: { $sum: 1 },
          docs: { $push: "$_id" },
        },
      },
      {
        $match: {
          count: { $gt: 1 },
        },
      },
    ])
    .toArray();

  return duplicates;
};
