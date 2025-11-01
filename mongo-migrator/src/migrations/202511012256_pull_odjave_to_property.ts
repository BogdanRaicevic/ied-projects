import type { Connection } from "mongoose";

export const up = async (db: Connection) => {
  try {
    const mongoCollection = db.collection("firmas");
    const cursor = mongoCollection.find();

    while (await cursor.hasNext()) {
      const document = await cursor.next();
      if (!document) continue;

      const isFirmaOdjavljen =
        document.komentar &&
        typeof document.komentar === "string" &&
        /odjav/i.test(document.komentar);

      await mongoCollection.updateOne(
        { _id: document._id },
        { $set: { prijavljeni: !isFirmaOdjavljen } },
      );

      for (const z of document.zaposleni) {
        if (!z._id) continue; // Skip if zaposleni has no _id

        const isZaposleniOdjavljen =
          z.komentar &&
          typeof z.komentar === "string" &&
          /odjav/i.test(z.komentar);

        // Update the specific zaposleni sub-document
        await mongoCollection.updateOne(
          { _id: document._id, "zaposleni._id": z._id },
          { $set: { "zaposleni.$.prijavljeni": !isZaposleniOdjavljen } },
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
