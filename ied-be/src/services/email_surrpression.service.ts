import type { SuppressedEmail } from "@ied-shared/index";
import { EmailSuppression } from "../models/email_suppression.model";

export const addSuppressedEmail = async (
  suppressedEmails: SuppressedEmail[],
) => {
  try {
    suppressedEmails.forEach(async (email) => {
      await EmailSuppression.updateOne(
        { email: email.email.toLowerCase() },
        { $set: { reason: email.reason } },
        { upsert: true },
      ).exec();
    });
  } catch (error) {
    console.error("Error adding suppressed emails:", error);
    throw new Error("Error adding suppressed emails");
  }
};
