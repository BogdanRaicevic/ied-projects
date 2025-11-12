import {
  EmailSuppression,
  type SuppressionReason,
} from "../models/email_suppression.model";

export const addSuppressedEmail = async (
  emails: string[],
  reason: SuppressionReason,
) => {
  try {
    for (const email of emails) {
      await EmailSuppression.updateOne(
        { email: email.toLowerCase() },
        { $set: { reason } },
        { upsert: true },
      ).exec();
    }
  } catch (error) {
    console.error("Error adding suppressed emails:", error);
    throw new Error("Error adding suppressed emails");
  }
};
