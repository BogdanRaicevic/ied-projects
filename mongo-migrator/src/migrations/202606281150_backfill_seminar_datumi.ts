import type { Connection } from "mongoose";

// Backfill datumi from the legacy single datum so datumi becomes the
// canonical list of all seminar dates. Idempotent: only touches seminars
// that have a real datum but no datumi yet, so re-running is a no-op.
export const up = async (db: Connection) => {
  try {
    const seminariCollection = db.collection("seminari");

    const result = await seminariCollection.updateMany(
      {
        datum: { $type: "date" },
        $or: [{ datumi: { $exists: false } }, { datumi: { $size: 0 } }],
      },
      [{ $set: { datumi: ["$datum"] } }],
    );

    console.log(
      `Migration completed: backfilled datumi from datum for ${result.modifiedCount} seminari.`,
    );
  } catch (error) {
    console.error("Error during migration to backfill seminar datumi:", error);
    throw error;
  }
};
