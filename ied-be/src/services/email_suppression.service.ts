import type { SuppressedEmail } from "@ied-shared/index";
import { EmailSuppression } from "../models/email_suppression.model";

export const addSuppressedEmail = async (
  suppressedEmails: SuppressedEmail[],
) => {
  try {
    await Promise.all(
      suppressedEmails.map(async (suppressedEmail) => {
        EmailSuppression.updateOne(
          { email: suppressedEmail.email.toLowerCase() },
          { $set: { reason: suppressedEmail.reason.toUpperCase() } },
          { upsert: true },
        ).exec();
      }),
    );
  } catch (error) {
    console.error("Error adding suppressed emails:", error);
    throw new Error("Error adding suppressed emails");
  }
};

export const isEmailSuppressed = async (email: string): Promise<boolean> => {
  const result = await EmailSuppression.findOne({
    email: email.toLowerCase(),
  }).exec();
  return result !== null;
};
