import type { SuppressedEmail } from "ied-shared";
import { EmailSuppression } from "../models/email_suppression.model";
import { Firma } from "../models/firma.model";

export const addSuppressedEmail = async (
  suppressedEmails: SuppressedEmail[],
) => {
  // Sanitize entries - strip BOM and normalize keys
  const sanitizedEmails = suppressedEmails.map((entry) => {
    const clean: Record<string, string> = {};
    for (const [key, value] of Object.entries(entry)) {
      // Strip BOM and whitespace from keys
      const cleanKey = key
        .replace(/^\uFEFF/, "")
        .trim()
        .toLowerCase();
      clean[cleanKey] = value;
    }
    return clean as SuppressedEmail;
  });

  const results = {
    total: sanitizedEmails.length,
    succeeded: 0,
    failed: [] as { email: string; reason: string; error: string }[],
  };

  try {
    const promises = sanitizedEmails.map(async (suppressedEmail, index) => {
      // Validate before attempting
      if (!suppressedEmail?.email) {
        const rawValue = JSON.stringify(suppressedEmail);
        console.error(
          `❌ Skipping entry #${index}: missing email. Raw value: ${rawValue}`,
        );
        results.failed.push({
          email: "(missing)",
          reason: suppressedEmail?.reason || "(missing)",
          error: `Email is undefined/null. Full entry: ${rawValue}`,
        });
        return;
      }

      try {
        await EmailSuppression.updateOne(
          { email: suppressedEmail.email.toLowerCase() },
          {
            $set: {
              reason: suppressedEmail.reason?.toUpperCase() || "UNKNOWN",
            },
          },
          { upsert: true },
        ).exec();

        results.succeeded++;
      } catch (error) {
        console.error(
          `❌ Failed to upsert email "${suppressedEmail.email}":`,
          error,
        );
        results.failed.push({
          email: suppressedEmail.email,
          reason: suppressedEmail.reason,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    });

    await Promise.all(promises); // Don't use Promise.allSettled here because we catch internally

    // Summary log
    if (results.failed.length > 0) {
      console.warn(
        `⚠️ Email suppression partial failure: ${results.succeeded} succeeded, ${results.failed.length} failed`,
      );
      console.warn("Failed entries:", results.failed);
    } else {
      console.log(`✅ All ${results.succeeded} emails processed successfully`);
    }
  } catch (error) {
    // This only catches unexpected errors in the orchestration, not individual items
    console.error("Unexpected error in addSuppressedEmail:", error);
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
    deleted: 0,
  };

  try {
    const normalizedEmails = [
      ...new Set(emails.map((email) => email.toLowerCase())),
    ];

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
      deleted: results.deleted,
    });

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
