import { Types } from "mongoose";
import { mongoDbConnection } from "../config";

export const up = async () => {
  try {
    const mongoDb = await mongoDbConnection();
    const firmasCollection = mongoDb.collection("firmas");

    const firms = await firmasCollection
      .find({ "zaposleni._id": { $exists: false } })
      .toArray();

    const bulkOps = firms.map((firma) => {
      const updatedZaposleni = firma.zaposleni.map((z: any) => {
        if (!z._id) {
          return { ...z, _id: new Types.ObjectId() };
        }
        return z;
      });

      return {
        updateOne: {
          filter: { _id: firma._id },
          update: { $set: { zaposleni: updatedZaposleni } },
        },
      };
    });

    if (bulkOps.length > 0) {
      await firmasCollection.bulkWrite(bulkOps);
    }
  } catch (error) {
    console.error(
      "Error during migration while adding missing zaposleni _id:",
      error,
    );
    throw error;
  }
};
