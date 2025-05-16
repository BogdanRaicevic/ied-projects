import { mongoDbConnection } from "../config";

export const up = async () => {
  const mongoDb = await mongoDbConnection();

  try {
    const mongoCollection = mongoDb.collection("seminari");

    // Find documents that need updating
    const cursor = mongoCollection.find({
      $or: [
        { onlineCena: { $type: "string" } },
        { offlineCena: { $type: "string" } },
        { datum: { $not: { $type: "date" } } },
      ],
    });

    const bulkOps: any[] = [];
    let processedCount = 0;
    let errorCount = 0;

    while (await cursor.hasNext()) {
      const document = await cursor.next();
      processedCount++;

      if (!document) continue;

      const updatePayload: { $set: Record<string, any> } = { $set: {} };
      let needsUpdate = false;

      // --- Process datum ---
      if (document.datum !== undefined && !(document.datum instanceof Date)) {
        const parsedDate = new Date(document.datum);
        if (!isNaN(parsedDate.valueOf())) {
          updatePayload.$set.datum = parsedDate;
          needsUpdate = true;
        } else {
          console.warn(
            `Could not parse datum "${document.datum}" for doc ${document._id}. Skipping datum update.`
          );
          errorCount++;
        }
      }

      // --- Process onlineCena ---
      if (typeof document.onlineCena === "string") {
        if (document.onlineCena === "") {
          updatePayload.$set.onlineCena = 0;
          needsUpdate = true;
        } else {
          const parsedCena = parseFloat(document.onlineCena);
          // --- Check for NaN ---
          if (!isNaN(parsedCena)) {
            updatePayload.$set.onlineCena = parsedCena;
            needsUpdate = true;
          } else {
            console.warn(
              `Could not parse onlineCena "${document.onlineCena}" to a valid number for doc ${document._id}. Skipping onlineCena update.`
            );
            errorCount++;
          }
        }
      }

      // --- Process offlineCena ---
      if (typeof document.offlineCena === "string") {
        if (document.offlineCena === "") {
          updatePayload.$set.offlineCena = 0;
          needsUpdate = true;
        } else {
          const parsedCena = parseFloat(document.offlineCena);
          // --- Check for NaN ---
          if (!isNaN(parsedCena)) {
            updatePayload.$set.offlineCena = parsedCena;
            needsUpdate = true;
          } else {
            console.warn(
              `Could not parse offlineCena "${document.offlineCena}" to a valid number for doc ${document._id}. Skipping offlineCena update.`
            );
            errorCount++;
          }
        }
      }

      // Add to bulk operations if any field needs update
      if (needsUpdate) {
        bulkOps.push({
          updateOne: {
            filter: { _id: document._id },
            update: updatePayload,
          },
        });
      }
    } // End while loop

    console.log(`Processed ${processedCount} potential documents.`);

    // Execute bulk write
    if (bulkOps.length > 0) {
      await mongoCollection.bulkWrite(bulkOps, { ordered: false });
      console.log(
        `Migration finished. Documents targeted for update: ${bulkOps.length}. Parse/Skip errors: ${errorCount}`
      );
    } else {
      console.log("Migration finished. No documents required updates based on query and parsing.");
    }
  } catch (error) {
    console.error("Error during migration of fix bad emails:", error);
    throw error;
  }
};
