import type { Connection } from "mongoose";

export const up = async (db: Connection) => {
  try {
    const firmasCollection = db.collection("firmas");
    const mestaCollection = db.collection("mesta");

    const allMesta = (await mestaCollection.find({}).toArray()).map((m) => ({
      mesto_id: m._id,
      naziv_mesto: m.naziv_mesto,
    }));

    // fetch firmas that have a non-empty mesto
    const firmas = await firmasCollection
      .find(
        { mesto: { $exists: true, $nin: [null, ""] } },
        { projection: { _id: 1, mesto: 1 } },
      )
      .toArray();

    const bulkOps: any[] = [];

    for (const firma of firmas) {
      const mesto = allMesta.find((m) => m.naziv_mesto === firma.mesto);
      if (mesto) {
        bulkOps.push({
          updateOne: {
            filter: { _id: firma._id },
            update: { $set: { mesto_id: mesto.mesto_id } },
          },
        });
      }
    }

    if (bulkOps.length > 0) {
      const res = await firmasCollection.bulkWrite(bulkOps, { ordered: false });
      console.log(
        `[MIGRATION] Updated ${res.modifiedCount} firmas (matched: ${res.matchedCount}).`,
      );
    } else {
      console.log("[MIGRATION] No firmas needed updates.");
    }
  } catch (error) {
    console.error("Error during migration of mesto value to mesto id:", error);
    throw error;
  }
};
