import { EmailSchema, type SuppressedEmail } from "ied-shared";
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
  const results = {
    suggested: emails.length,
    valid: 0,
    deleted: 0,
    invalid: [] as { email: string; reason: string }[],
  };

  try {
    // Validate each email individually
    const validEmails: string[] = [];

    for (const email of emails) {
      const parseResult = EmailSchema.safeParse(email);
      if (parseResult.success) {
        validEmails.push(parseResult.data.toLowerCase());
        results.valid++;
      } else {
        results.invalid.push({
          email,
          reason: parseResult.error.issues.map((e) => e.message).join(", "),
        });
      }
    }

    // Remove duplicates
    const normalizedEmails = [...new Set(validEmails)];

    if (normalizedEmails.length === 0) {
      console.log("No valid emails to delete", results);
      return results;
    }

    // Perform deletions
    const [firmaResult, zaposleniResult] = await Promise.all([
      Firma.updateMany(
        { e_mail: { $in: normalizedEmails } },
        { $set: { e_mail: "" } },
      ).exec(),
      Firma.updateMany(
        { "zaposleni.e_mail": { $in: normalizedEmails } },
        { $set: { "zaposleni.$[employee].e_mail": "" } },
        { arrayFilters: [{ "employee.e_mail": { $in: normalizedEmails } }] },
      ).exec(),
    ]);

    results.deleted =
      (firmaResult.modifiedCount || 0) + (zaposleniResult.modifiedCount || 0);

    // Log the summary
    console.log(`Email deletion results:`, {
      suggested: results.suggested,
      valid: results.valid,
      deleted: results.deleted,
      invalid: results.invalid,
    });

    // Log individual failures
    for (const invalid of results.invalid) {
      console.log(
        `  ❌ Failed validation: "${invalid.email}" - ${invalid.reason}`,
      );
    }

    return results;
  } catch (error) {
    console.error(`Email deletion error:`, error);
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
