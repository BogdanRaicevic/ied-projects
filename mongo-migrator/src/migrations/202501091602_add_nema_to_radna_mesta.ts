import type { Connection } from "mongoose";

export const up = async (db: Connection) => {
  const mongoCollectionName = "firmas";

  try {
    const mongoCollection = db.collection(mongoCollectionName);

    const cursor = mongoCollection.find();

    while (await cursor.hasNext()) {
      const document = await cursor.next();

      const zaposleni: {
        [key: string]: number | string | Date;
        radno_mesto: string;
      }[] = document?.zaposleni || [];

      // Update emails in place
      for (const z of zaposleni) {
        z.radno_mesto = z.radno_mesto || "nema";
      }

      await mongoCollection.updateOne(
        {
          _id: document?._id,
        },
        { $set: { zaposleni: zaposleni } },
      );
    }
  } catch (error) {
    console.error("Error during migration of fix bad emails:", error);
    throw error;
  }
};
