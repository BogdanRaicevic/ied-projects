import { type Connection, Types } from "mongoose";

export const up = async (db: Connection) => {
  try {
    const mongoCollection = db.collection("seminari");

    // Find only documents that have at least one string ID to process
    const cursor = mongoCollection.find({
      $or: [
        { "prijave.firma_id": { $type: "string" } },
        { "prijave.zaposleni_id": { $type: "string" } },
      ],
    });

    while (await cursor.hasNext()) {
      const document = await cursor.next();
      if (!document || !document.prijave) {
        continue;
      }

      let hasChanges = false;

      const updatedPrijave = document.prijave.map((prijava: any) => {
        const newPrijava = { ...prijava };

        // Convert firma_id if it's a string
        if (newPrijava.firma_id && typeof newPrijava.firma_id === "string") {
          try {
            newPrijava.firma_id = Types.ObjectId.createFromHexString(
              newPrijava.firma_id,
            );
            hasChanges = true;
          } catch (error) {
            console.error(
              `Invalid firma_id "${newPrijava.firma_id}" in document ${document._id}`,
              error,
            );
            throw error;
          }
        }

        // Convert zaposleni_id if it's a string
        if (
          newPrijava.zaposleni_id &&
          typeof newPrijava.zaposleni_id === "string"
        ) {
          try {
            newPrijava.zaposleni_id = Types.ObjectId.createFromHexString(
              newPrijava.zaposleni_id,
            );
            hasChanges = true;
          } catch (error) {
            console.error(
              `Invalid zaposleni_id "${newPrijava.zaposleni_id}" in document ${document._id}`,
              error,
            );
            throw error;
          }
        }

        return newPrijava;
      });

      if (hasChanges) {
        await mongoCollection.updateOne(
          { _id: document._id },
          { $set: { prijave: updatedPrijave } },
        );
      }
    }
    console.log("Migration completed successfully.");
  } catch (error) {
    console.error(
      "Error during migration to convert prijave firma_id and zaposleni_id from strings to ObjectId:",
      error,
    );
    throw error;
  }
};
