import { type Connection, Types } from "mongoose";

export const up = async (db: Connection) => {
  try {
    const firmasCollection = db.collection("firmas");

    const cursor = firmasCollection.find({}, { projection: { zaposleni: 1 } });
    const bulkOps: any[] = [];

    while (await cursor.hasNext()) {
      const firma: any = await cursor.next();
      if (!firma) continue;
      if (!Array.isArray(firma.zaposleni) || firma.zaposleni.length === 0)
        continue;
      let changed = false;

      const updatedZaposleni = firma.zaposleni.map((z: any) => {
        if (!z._id || !Types.ObjectId.isValid(z._id)) {
          changed = true;
          return { ...z, _id: new Types.ObjectId() };
        }
        return z;
      });

      if (changed) {
        bulkOps.push({
          updateOne: {
            filter: { _id: firma._id },
            update: { $set: { zaposleni: updatedZaposleni } },
          },
        });
      }
    }

    if (bulkOps.length > 0) {
      const res = await firmasCollection.bulkWrite(bulkOps, { ordered: false });
      console.log(
        `[MIGRATION] Updated ${res.modifiedCount} firms (matched: ${res.matchedCount}).`,
      );
    } else {
      console.log("[MIGRATION] No firms needed updates.");
    }
  } catch (error) {
    console.error(
      "Error during migration while adding missing zaposleni _id:",
      error,
    );
    throw error;
  }
};
