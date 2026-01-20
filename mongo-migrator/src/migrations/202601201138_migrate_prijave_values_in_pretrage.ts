import type { Connection } from "mongoose";

export const up = async (db: Connection) => {
  const mongoCollectionName = "pretrage";

  try {
    const mongoCollection = db.collection(mongoCollectionName);

    await mongoCollection.updateMany(
      {
        firmaPrijavljeni: { $in: [true, false] },
      },
      [
        {
          $set: {
            firmaPrijavljeni: {
              $cond: [
                { $eq: ["$firmaPrijavljeni", true] },
                "subscribed",
                "unsubscribed",
              ],
            },
          },
        },
      ],
    );

    await mongoCollection.updateMany(
      {
        zaposleniPrijavljeni: { $in: [true, false] },
      },
      [
        {
          $set: {
            zaposleniPrijavljeni: {
              $cond: [
                { $eq: ["$zaposleniPrijavljeni", true] },
                "subscribed",
                "unsubscribed",
              ],
            },
          },
        },
      ],
    );
  } catch (error) {
    console.error("Error during migration of pretrage field renames:", error);
    throw error;
  }
};
