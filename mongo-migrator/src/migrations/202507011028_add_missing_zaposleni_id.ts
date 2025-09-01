import { type Connection, Types } from "mongoose";

export const up = async (db: Connection) => {
  try {
    const firmasCollection = db.collection("firmas");

    const firms = await firmasCollection.find().toArray();

    const bulkOps = [];

    for (const firma of firms) {
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
      await firmasCollection.bulkWrite(bulkOps);
      console.log(`Updated ${bulkOps.length} firms.`);
    } else {
      console.log("No firms needed updates.");
    }
  } catch (error) {
    console.error(
      "Error during migration while adding missing zaposleni _id:",
      error,
    );
    throw error;
  }
};
