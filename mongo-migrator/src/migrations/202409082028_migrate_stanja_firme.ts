import type { Connection } from "mongoose";

export const up = async (db: Connection) => {
  const stanja = ["stecaj", "likvidacija", "blokada"] as const;

  const propertyMap = {
    stecaj: "Stečaj",
    likvidacija: "Likvidacija",
    blokada: "Blokada",
    neZnam: "Ne znam",
    aktivna: "Aktivna",
  };

  const firmasCollection = db.collection("firmas");

  try {
    const firmasCursor = firmasCollection.find({});

    while (await firmasCursor.hasNext()) {
      const firma = await firmasCursor.next();

      if (!firma) {
        continue;
      }

      let finalResult = propertyMap.neZnam;

      for (const item of stanja) {
        if (firma[item] === 1) {
          finalResult = propertyMap[item];
          break;
        }
      }

      await firmasCollection.updateOne(
        { _id: firma._id },
        {
          $set: { stanje_firme: finalResult },
          $unset: { likvidacija: 0, blokada: 0, stecaj: 0 },
        },
      );
    }
  } catch (error) {
    console.error("Error during migration:", error);
    throw error;
  }
};
