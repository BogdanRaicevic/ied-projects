import type { Connection } from "mongoose";

export const up = async (db: Connection) => {
  try {
    const firmasCollection = db.collection("firmas");

    const result = await firmasCollection.updateMany(
      { mesto_id: { $exists: true } },
      { $rename: { mesto_id: "mesto" } },
    );

    console.log(
      `[MIGRATION] Renamed mesto_id -> mesto in ${result.modifiedCount} firmas (matched: ${result.matchedCount}).`,
    );
  } catch (error) {
    console.error("Error during migration of mesto_id to mesto:", error);
    throw error;
  }
};
