import type { Connection } from "mongoose";

export const up = async (db: Connection) => {
  const odjava = "odjava";

  const firmasCollection = db.collection("firmas");

  try {
    const firmasCursor = firmasCollection.find({});

    while (await firmasCursor.hasNext()) {
      const firma = await firmasCursor.next();

      if (!firma) {
        continue;
      }

      let result = false;
      if (firma[odjava] === 1) {
        result = true;
      }

      await firmasCollection.updateOne(
        { _id: firma?._id },
        { $set: { odjava: result } },
      );
    }
  } catch (error) {
    console.error("Error during migration:", error);
    throw error;
  }
};
