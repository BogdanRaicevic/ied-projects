import type { Connection } from "mongoose";

export const up = async (db: Connection) => {
  try {
    const firmasCollection = db.collection("firmas");

    // Unset `mesto` on any firma where it is an empty string or any other
    // non-ObjectId value that would cause a CastError when populated.
    // Valid ObjectId strings are 24-character hex strings; anything else is invalid.
    const result = await firmasCollection.updateMany(
      {
        $expr: {
          $and: [
            { $eq: [{ $type: "$mesto" }, "string"] }, // only match string values (not ObjectId BSON type)
          ],
        },
      },
      { $unset: { mesto: "" } },
    );

    console.log(
      `[MIGRATION] Unset invalid string \`mesto\` field on ${result.modifiedCount} firmas (matched: ${result.matchedCount}).`,
    );
  } catch (error) {
    console.error(
      "Error during migration to remove invalid mesto values:",
      error,
    );
    throw error;
  }
};
