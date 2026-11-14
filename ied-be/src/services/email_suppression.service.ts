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
// Bounced / spam-flagged addresses can never be re-subscribed or downgraded.
const PERMANENT_REASONS = new Set<SuppressionReasons>([
  SUPPRESSION_REASONS.HARD_BOUNCE,
  SUPPRESSION_REASONS.SPAM_COMPLAINT,
]);
// Contacts store e_mail as typed; the suppression list stores it lowercase.
const CASE_INSENSITIVE = { locale: "en", strength: 2 };

type SuppressedEmailFailure = {
  row: number;
  email: string | null;
  reason: string | null;
  error: string;
};

type AddSuppressedEmailResult = {
  totalRows: number;
  uniqueRows: number;
  duplicateRows: number;
  invalidRows: number;
  upsertedCount: number;
  matchedCount: number;
  modifiedCount: number;
  failures: SuppressedEmailFailure[];
};

export const normalizeEmail = (email: string | undefined | null) =>
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

// Keeps the invariant: one prijavljeni value for every firma and zaposleni
// that shares an email.
const setPrijavljeniForEmails = (emails: string[], prijavljeni: boolean) =>
  Promise.all([
    Firma.updateMany(
      { e_mail: { $in: emails } },
      { $set: { prijavljeni } },
      { collation: CASE_INSENSITIVE },
    ).exec(),
    Firma.updateMany(
      { "zaposleni.e_mail": { $in: emails } },
      { $set: { "zaposleni.$[z].prijavljeni": prijavljeni } },
      {
        arrayFilters: [{ "z.e_mail": { $in: emails } }],
        collation: CASE_INSENSITIVE,
      },
    ).exec(),
  ]);

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

    // Last occurrence wins, except UNSUBSCRIBED never replaces a permanent reason.
    const reason = normalizedReason as SuppressionReasons;
    const previous = dedupedEntries.get(normalizedEmail);
    if (
      previous &&
      PERMANENT_REASONS.has(previous) &&
      !PERMANENT_REASONS.has(reason)
    ) {
      return;
    }
    dedupedEntries.set(normalizedEmail, reason);
  });

  const entries = Array.from(dedupedEntries.entries());

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

  if (entries.length === 0) {
    return result;
  }

  try {
    const chunks = chunkArray(entries, BULK_WRITE_CHUNK_SIZE);

    for (const chunk of chunks) {
      const operations = chunk.map(([email, reason]) => ({
        updateOne: {
          filter: { email },
          // UNSUBSCRIBED only inserts, so it can't overwrite a permanent reason.
          update: PERMANENT_REASONS.has(reason)
            ? { $set: { reason } }
            : { $setOnInsert: { reason } },
          upsert: true,
        },
      }));

      const bulkResult = await EmailSuppression.bulkWrite(operations, {
        ordered: false,
      });

      result.upsertedCount += bulkResult.upsertedCount ?? 0;
      result.matchedCount += bulkResult.matchedCount ?? 0;
      result.modifiedCount += bulkResult.modifiedCount ?? 0;

      await setPrijavljeniForEmails(
        chunk.map(([email]) => email),
        false,
      );
    }

    return result;
  } catch (error) {
    // This only catches unexpected errors in the orchestration, not individual items
    console.error("Unexpected error in addSuppressedEmail:", error);
    throw error;
  }
};

/**
 * Re-subscribe: removes an UNSUBSCRIBED email and sets prijavljeni=true on
 * every contact with it. Returns null (→ 409) for a permanent reason.
 */
export const removeSuppressedEmail = async (email: string) => {
  try {
    const normalizedEmail = normalizeEmail(email);
    const permanentReasons = [...PERMANENT_REASONS];

    // The reason filter makes the delete itself refuse a permanent row, even
    // if an upload upgraded it a moment ago.
    const { deletedCount } = await EmailSuppression.deleteOne({
      email: normalizedEmail,
      reason: { $nin: permanentReasons },
    }).exec();
    // Nothing deleted: either permanent (refuse) or no row at all (legacy
    // unsubscribed contact — re-subscribe still applies).
    if (
      deletedCount === 0 &&
      (await EmailSuppression.exists({
        email: normalizedEmail,
        reason: { $in: permanentReasons },
      }))
    ) {
      return null;
    }

    await setPrijavljeniForEmails([normalizedEmail], true);
    return normalizedEmail;
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

export const getSuppressedEmailsSet = async (
  emails: string[],
): Promise<Set<string>> => {
  const normalizedEmails = [
    ...new Set(emails.map(normalizeEmail).filter(Boolean)),
  ];

  if (normalizedEmails.length === 0) {
    return new Set();
  }

  const suppressed = await EmailSuppression.find(
    { email: { $in: normalizedEmails } },
    { email: 1 },
  ).lean();

  return new Set(suppressed.map((s) => s.email));
};
