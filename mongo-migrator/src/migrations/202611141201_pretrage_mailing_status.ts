import type { Connection } from "mongoose";

// Saved searches: firmaPrijavljeni / zaposleniPrijavljeni ("all" |
// "subscribed" | "unsubscribed") → firmaMailingStatus /
// zaposleniMailingStatus (array; [] = no filter). "unsubscribed" meant
// prijavljeni=false, which covered every suppression reason. Re-run safe:
// the old fields are gone after the first run.
const STATUSI: Record<string, string[]> = {
  subscribed: ["SUBSCRIBED"],
  unsubscribed: ["UNSUBSCRIBED", "HARD_BOUNCE", "SPAM_COMPLAINT"],
};
const FIELDS = [
  ["firmaPrijavljeni", "firmaMailingStatus"],
  ["zaposleniPrijavljeni", "zaposleniMailingStatus"],
] as const;

export const up = async (db: Connection) => {
  try {
    const pretrage = db.collection("pretrage");

    for (const [oldField, newField] of FIELDS) {
      for (const [value, statusi] of Object.entries(STATUSI)) {
        await pretrage.updateMany(
          { [oldField]: value },
          { $set: { [newField]: statusi } },
        );
      }
      await pretrage.updateMany(
        { [newField]: { $exists: false } },
        { $set: { [newField]: [] } },
      );
      await pretrage.updateMany(
        { [oldField]: { $exists: true } },
        { $unset: { [oldField]: "" } },
      );
    }
  } catch (error) {
    console.error("Error migrating pretrage to mailing_status:", error);
    throw error;
  }
};
