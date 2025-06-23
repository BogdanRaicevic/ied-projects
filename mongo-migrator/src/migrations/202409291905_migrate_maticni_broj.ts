import { mongoDbConnection } from "../config";

export const up = async () => {
  const mongoDb = await mongoDbConnection();
  const mongoCollectionName = "firmas";

  try {
    const mongoCollection = mongoDb.collection(mongoCollectionName);

    const cursor = mongoCollection.find();

    while (await cursor.hasNext()) {
      const document: any = await cursor.next();

      const oldPib = ((document?.PIB as string) || "").toLowerCase();
      if (oldPib.includes("mb:")) {
        const pibParts = oldPib.split("mb:");
        const pibPart = pibParts[0].trim().replace(/,/g, "");
        const mbPart = pibParts[1].trim();

        const numberRegex = /^\d*$/;

        if (!numberRegex.test(pibPart) || !numberRegex.test(mbPart)) {
          console.error(
            "Invalid pib or mb, company name: ",
            document.naziv_firme,
            "pib:",
            pibPart,
            "mb:",
            mbPart,
          );
          continue;
        }

        await mongoCollection.updateOne(
          {
            _id: document._id,
          },
          { $set: { maticni_broj: mbPart, PIB: pibPart } },
        );
      }
    }
  } catch (error) {
    console.error("Error during migration of maticni broj:", error);
    throw error;
  }
};
