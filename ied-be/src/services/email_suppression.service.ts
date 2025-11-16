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

export const removeSuppressedEmail = async (email: string) => {
  try {
    await EmailSuppression.deleteOne({ email: email.toLowerCase() }).exec();
  } catch (error) {
    console.error("Error removing suppressed email:", error);
    throw new Error("Error removing suppressed email");
  }
};

export const isEmailSuppressed = async (email: string) => {
  const result = await EmailSuppression.findOne({
    email: email.toLowerCase(),
  }).exec();

  return {
    suppressed: result !== null ? result.reason : false,
  };
};
