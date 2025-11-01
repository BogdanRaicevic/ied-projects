import type { Connection } from "mongoose";

export const up = async (db: Connection) => {
  try {
    const mongoCollection = db.collection("firmas");
    const cursor = mongoCollection.find();

    while (await cursor.hasNext()) {
      const document = await cursor.next();
      if (!document) continue;

      const isOdjavljen =
        document.komentar &&
        typeof document.komentar === "string" &&
        /odjava/i.test(document.komentar);

      if (document?.komentar.includes("odjava")) {
        await mongoCollection.updateOne(
          { _id: document._id },
          { $set: { prijavljeni: !isOdjavljen } },
        );
      }
    }
  } catch (error) {
    console.error(
      "Error during migration to pull odjava from komentar to new property:",
      error,
    );
    throw error;
  }
};
