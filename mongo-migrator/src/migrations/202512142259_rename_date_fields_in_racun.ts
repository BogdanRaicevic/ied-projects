import type { Connection } from "mongoose";

export const up = async (db: Connection) => {
  try {
    const racuniCollection = db.collection("racuni");

    await racuniCollection.updateMany(
      {},
      {
        $rename: {
          dateCreatedAt: "created_at",
          dateUpdatedAt: "updated_at",
        },
      },
    );

    console.log(
      "Migration completed: Renamed timestamp fields in racuni collection",
    );
  } catch (error) {
    console.error(
      "Error during migration to rename racun timestamp fields:",
      error,
    );
    throw error;
  }
};
