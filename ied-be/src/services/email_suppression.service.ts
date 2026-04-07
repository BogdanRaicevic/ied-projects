import {
  SUPPRESSION_REASONS,
  type SuppressedEmail,
  type SuppressionReasons,
} from "ied-shared";
import { EmailSuppression } from "../models/email_suppression.model";
import { Firma } from "../models/firma.model";

const VALID_SUPPRESSION_REASONS = new Set<SuppressionReasons>(
  Object.values(SUPPRESSION_REASONS),
);
const BULK_WRITE_CHUNK_SIZE = 500;

type SuppressedEmailFailure = {
  row: number;
  email: string | null;
  reason: string | null;
  error: string;
};

export type AddSuppressedEmailResult = {
  totalRows: number;
  uniqueRows: number;
  duplicateRows: number;
  invalidRows: number;
  upsertedCount: number;
  matchedCount: number;
  modifiedCount: number;
  failures: SuppressedEmailFailure[];
};

const normalizeEmail = (email: string | undefined | null) =>
  email?.trim().toLowerCase() ?? "";

const normalizeReason = (reason: string | undefined | null) =>
  reason?.trim().toUpperCase() ?? "";

const chunkArray = <T>(items: T[], chunkSize: number) => {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += chunkSize) {
    chunks.push(items.slice(index, index + chunkSize));
  }

  return chunks;
};

export const addSuppressedEmail = async (
  suppressedEmails: SuppressedEmail[],
) => {
  const failures: SuppressedEmailFailure[] = [];
  const dedupedEntries = new Map<string, SuppressionReasons>();

  suppressedEmails.forEach((suppressedEmail, index) => {
    const normalizedEmail = normalizeEmail(suppressedEmail?.email);
    const normalizedReason = normalizeReason(suppressedEmail?.reason);

    if (!normalizedEmail) {
      failures.push({
        row: index + 1,
        email: null,
        reason: normalizedReason || null,
        error: "Missing email",
      });
      return;
    }

    if (
      !VALID_SUPPRESSION_REASONS.has(normalizedReason as SuppressionReasons)
    ) {
      failures.push({
        row: index + 1,
        email: normalizedEmail,
        reason: normalizedReason || null,
        error: "Invalid suppression reason",
      });
      return;
    }

    // Last occurrence wins so repeated CSV rows collapse deterministically.
    dedupedEntries.set(normalizedEmail, normalizedReason as SuppressionReasons);
  });

  const operations = Array.from(dedupedEntries.entries()).map(
    ([email, reason]) => ({
      updateOne: {
        filter: { email },
        update: {
          $set: {
            email,
            reason,
          },
        },
        upsert: true,
      },
    }),
  );

  const result: AddSuppressedEmailResult = {
    totalRows: suppressedEmails.length,
    uniqueRows: dedupedEntries.size,
    duplicateRows:
      suppressedEmails.length - failures.length - dedupedEntries.size,
    invalidRows: failures.length,
    upsertedCount: 0,
    matchedCount: 0,
    modifiedCount: 0,
    failures,
  };

  if (operations.length === 0) {
    return result;
  }

  try {
    const chunks = chunkArray(operations, BULK_WRITE_CHUNK_SIZE);

    for (const chunk of chunks) {
      const bulkResult = await EmailSuppression.bulkWrite(chunk, {
        ordered: false,
      });

      result.upsertedCount += bulkResult.upsertedCount ?? 0;
      result.matchedCount += bulkResult.matchedCount ?? 0;
      result.modifiedCount += bulkResult.modifiedCount ?? 0;
    }

    return result;
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
