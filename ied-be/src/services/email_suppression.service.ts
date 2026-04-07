import type { SuppressedEmail } from "ied-shared";
import { EmailSuppression } from "../models/email_suppression.model";
import { Firma } from "../models/firma.model";

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
    throw error;
  }
};

export const removeSuppressedEmail = async (email: string) => {
  try {
    await EmailSuppression.deleteOne({ email: email.toLowerCase() }).exec();
  } catch (error) {
    console.error("Error removing suppressed email:", error);
    throw error;
  }
};

export const deleteEmails = async (emails: string[]) => {
  const suggestedCount = emails.length;

  try {
    const normalizedEmails = [
      ...new Set(emails.map((email) => email.toLowerCase())),
    ];

    if (normalizedEmails.length === 0) {
      return;
    }

    // Capture results from both operations
    const [firmaResult, zaposleniResult] = await Promise.all([
      Firma.updateMany(
        { e_mail: { $in: normalizedEmails } },
        { $set: { e_mail: "" } },
      ).exec(),
      Firma.updateMany(
        { "zaposleni.e_mail": { $in: normalizedEmails } },
        { $set: { "zaposleni.$[employee].e_mail": "" } },
        {
          arrayFilters: [{ "employee.e_mail": { $in: normalizedEmails } }],
        },
      ).exec(),
    ]);
    // Sum up total modified documents
    const deletedCount =
      (firmaResult.modifiedCount || 0) + (zaposleniResult.modifiedCount || 0);

    console.log(
      `Email deletion: ${suggestedCount} suggested, ${deletedCount} deleted`,
    );
  } catch (error) {
    console.error(
      `Email deletion failed for ${suggestedCount} suggested emails:`,
      error,
    );
    throw error;
  }
};

export const isEmailSuppressed = async (email?: string) => {
  if (!email) {
    return null;
  }

  const result = await EmailSuppression.findOne({
    email: email.toLowerCase(),
  }).exec();

  return result !== null ? result.reason : null;
};
