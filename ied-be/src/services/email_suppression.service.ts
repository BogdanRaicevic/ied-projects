import {
  isPermanent,
  MAILING_STATUS,
  type MailingStatus,
  nextMailingStatus,
  outranks,
  type SetSuppressedEmail,
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
// Spam-flagged addresses can never be re-subscribed or downgraded.
const PERMANENT_REASONS =
  Object.values(SUPPRESSION_REASONS).filter(isPermanent);
const ALL_REASONS = Object.values(SUPPRESSION_REASONS);
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

// Inserts the row, or overwrites a reason not in `keep`. Correct in either op
// order for one writer; concurrent writers to one email can race (rare).
const upsertReason = (
  email: string,
  reason: SuppressionReasons,
  keep: SuppressionReasons[],
) => [
  {
    updateOne: {
      filter: { email },
      update: { $setOnInsert: { reason } },
      upsert: true,
    },
  },
  {
    updateOne: {
      filter: { email, reason: { $nin: keep } },
      update: { $set: { reason } },
    },
  },
];

// The only writer of mailing_status for existing contacts. Keeps the
// invariant: every firma and zaposleni that shares an email has one status.
const setStatusForEmails = (emails: string[], status: MailingStatus) =>
  Promise.all([
    Firma.updateMany(
      { e_mail: { $in: emails } },
      { $set: { mailing_status: status } },
      { collation: CASE_INSENSITIVE },
    ).exec(),
    Firma.updateMany(
      { "zaposleni.e_mail": { $in: emails } },
      { $set: { "zaposleni.$[z].mailing_status": status } },
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

    const previous = dedupedEntries.get(normalizedEmail);
    dedupedEntries.set(
      normalizedEmail,
      nextMailingStatus(previous ?? MAILING_STATUS.SUBSCRIBED, {
        type: "IMPORT",
        reason: normalizedReason as SuppressionReasons,
      }),
    );
  });

  const entries = Array.from(dedupedEntries.entries());

  const result: AddSuppressedEmailResult = {
    totalRows: suppressedEmails.length,
    uniqueRows: dedupedEntries.size,
    duplicateRows:
      suppressedEmails.length - failures.length - dedupedEntries.size,
    invalidRows: failures.length,
    upsertedCount: 0,
    modifiedCount: 0,
    failures,
  };

  if (entries.length === 0) {
    return result;
  }

  try {
    const chunks = chunkArray(entries, BULK_WRITE_CHUNK_SIZE);

    for (const chunk of chunks) {
      // An import never overwrites a higher-ranked reason (see RANK).
      const operations = chunk.flatMap(([email, reason]) =>
        upsertReason(
          email,
          reason,
          ALL_REASONS.filter((r) => outranks(r, reason)),
        ),
      );

      const bulkResult = await EmailSuppression.bulkWrite(operations, {
        ordered: false,
      });

      result.upsertedCount += bulkResult.upsertedCount ?? 0;
      result.modifiedCount += bulkResult.modifiedCount ?? 0;

      // Contacts get the row's final reason: an import onto a higher-ranked
      // row keeps that one.
      const rows = await EmailSuppression.find(
        { email: { $in: chunk.map(([email]) => email) } },
        { email: 1, reason: 1 },
      ).lean();
      for (const status of new Set(rows.map((r) => r.reason))) {
        await setStatusForEmails(
          rows.filter((r) => r.reason === status).map((r) => r.email),
          status,
        );
      }
    }

    return result;
  } catch (error) {
    // This only catches unexpected errors in the orchestration, not individual items
    console.error("Unexpected error in addSuppressedEmail:", error);
    throw error;
  }
};

/**
 * Staff choice (e.g. INACTIVE → UNSUBSCRIBED and back): overrides any
 * non-permanent reason and syncs every contact with the email. Returns null
 * (→ 409) when the email is already spam.
 */
export const setSuppressedEmail = async (
  email: string,
  reason: SetSuppressedEmail["reason"],
) => {
  const normalizedEmail = normalizeEmail(email);
  await EmailSuppression.bulkWrite(
    upsertReason(normalizedEmail, reason, PERMANENT_REASONS),
    { ordered: false },
  );
  const row = await EmailSuppression.findOne(
    { email: normalizedEmail },
    { reason: 1 },
  ).lean();
  if (row && isPermanent(row.reason)) return null;

  // row.reason, not reason: a concurrent import may have raised it.
  await setStatusForEmails(
    [normalizedEmail],
    row?.reason ?? MAILING_STATUS.SUBSCRIBED,
  );
  return normalizedEmail;
};

/**
 * Re-subscribe: removes a non-permanent email and sets SUBSCRIBED on every
 * contact with it. Returns null (→ 409) for spam.
 */
export const removeSuppressedEmail = async (email: string) => {
  try {
    const normalizedEmail = normalizeEmail(email);
    // The reason filter makes the delete itself refuse a permanent row, even
    // if an upload upgraded it a moment ago.
    const { deletedCount } = await EmailSuppression.deleteOne({
      email: normalizedEmail,
      reason: { $nin: PERMANENT_REASONS },
    }).exec();
    // Nothing deleted: either permanent (refuse) or no row at all (legacy
    // unsubscribed contact — re-subscribe still applies).
    if (
      deletedCount === 0 &&
      (await EmailSuppression.exists({
        email: normalizedEmail,
        reason: { $in: PERMANENT_REASONS },
      }))
    ) {
      return null;
    }

    await setStatusForEmails([normalizedEmail], MAILING_STATUS.SUBSCRIBED);
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
      ...new Set(emails.map(normalizeEmail).filter(Boolean)),
    ];

    // Perform deletions
    const [firmaResult, zaposleniResult] = await Promise.all([
      Firma.updateMany(
        { e_mail: { $in: normalizedEmails } },
        // No email → SUBSCRIBED (a cleared bounce would otherwise stay red).
        { $set: { e_mail: "", mailing_status: MAILING_STATUS.SUBSCRIBED } },
        { collation: CASE_INSENSITIVE },
      ).exec(),
      Firma.updateMany(
        { "zaposleni.e_mail": { $in: normalizedEmails } },
        {
          $set: {
            "zaposleni.$[employee].e_mail": "",
            "zaposleni.$[employee].mailing_status": MAILING_STATUS.SUBSCRIBED,
          },
        },
        {
          arrayFilters: [{ "employee.e_mail": { $in: normalizedEmails } }],
          collation: CASE_INSENSITIVE,
        },
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
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    return null;
  }

  const result = await EmailSuppression.findOne({
    email: normalizedEmail,
  }).exec();

  return result !== null ? result.reason : null;
};
