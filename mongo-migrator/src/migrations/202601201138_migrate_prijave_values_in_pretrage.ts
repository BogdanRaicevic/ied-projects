import type { Connection } from "mongoose";
import { PRIJAVA_STATUS } from "../../../ied-shared/dist";

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
                PRIJAVA_STATUS.subscribed,
                PRIJAVA_STATUS.unsubscribed,
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
                PRIJAVA_STATUS.subscribed,
                PRIJAVA_STATUS.unsubscribed,
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
