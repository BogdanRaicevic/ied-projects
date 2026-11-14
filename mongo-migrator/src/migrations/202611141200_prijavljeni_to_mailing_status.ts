import type { Connection } from "mongoose";

// prijavljeni (boolean) → mailing_status, derived from email_suppressions
// (the only source of truth): a contact's status is its email's reason, else
// SUBSCRIBED; a contact without an email is always SUBSCRIBED. Legacy
// prijavljeni=false with an email is first added to the list as UNSUBSCRIBED.
// The final pass trims emails, derives every status, and removes the old field
// in one update per firma. Safe to re-run.
const CHUNK_SIZE = 500;
// Rough check, only to log suspicious legacy values for a manual fix.
const SIMPLE_EMAIL = /^[^\s@;,]+@[^\s@;,]+\.[^\s@;,]+$/;

const normalizeEmail = (email: unknown) =>
  typeof email === "string" ? email.trim().toLowerCase() : "";

export const up = async (db: Connection) => {
  try {
    const firmas = db.collection("firmas");
    const suppressions = db.collection("email_suppressions");

    // 1. Preserve legacy unsubscribes in the source-of-truth list.
    const pendingLegacyEmails = new Set<string>();
    const invalidEmailFirme = new Set<string>();
    let rowsAdded = 0;

    const flushLegacyEmails = async () => {
      if (pendingLegacyEmails.size === 0) return;
      const result = await suppressions.bulkWrite(
        [...pendingLegacyEmails].map((email) => ({
          updateOne: {
            filter: { email },
            update: { $setOnInsert: { reason: "UNSUBSCRIBED" } },
            upsert: true,
          },
        })),
        { ordered: false },
      );
      rowsAdded += result.upsertedCount;
      pendingLegacyEmails.clear();
    };

    const addEmail = (email: unknown, firmaId: unknown) => {
      const normalized = normalizeEmail(email);
      if (!normalized) return;
      pendingLegacyEmails.add(normalized);
      if (!SIMPLE_EMAIL.test(normalized))
        invalidEmailFirme.add(String(firmaId));
    };

    const legacyCursor = firmas.find(
      { $or: [{ prijavljeni: false }, { "zaposleni.prijavljeni": false }] },
      {
        projection: {
          e_mail: 1,
          prijavljeni: 1,
          "zaposleni.e_mail": 1,
          "zaposleni.prijavljeni": 1,
        },
      },
    );
    for await (const firma of legacyCursor) {
      if (firma.prijavljeni === false) addEmail(firma.e_mail, firma._id);
      for (const z of firma.zaposleni ?? []) {
        if (z.prijavljeni === false) addEmail(z.e_mail, firma._id);
      }
      if (pendingLegacyEmails.size >= CHUNK_SIZE) await flushLegacyEmails();
    }
    await flushLegacyEmails();

    // 2. Snapshot the source of truth for constant-time status lookups.
    const statusByEmail = new Map<string, string>();
    for await (const row of suppressions.find(
      {},
      { projection: { email: 1, reason: 1 } },
    )) {
      const email = normalizeEmail(row.email);
      if (email && typeof row.reason === "string") {
        statusByEmail.set(email, row.reason);
      }
    }

    // 3. One pass: trim emails, derive statuses, and remove prijavljeni.
    type FirmaOperation = Parameters<typeof firmas.bulkWrite>[0][number];
    const firmaOps: FirmaOperation[] = [];
    let migrated = 0;
    const flushFirmas = async () => {
      if (firmaOps.length === 0) return;
      const result = await firmas.bulkWrite(firmaOps, { ordered: false });
      if (result.matchedCount !== firmaOps.length) {
        throw new Error(
          `${firmaOps.length - result.matchedCount} firme changed during migration; re-run it`,
        );
      }
      migrated += result.modifiedCount;
      firmaOps.length = 0;
    };
    const statusFor = (email: unknown) => {
      const normalized = normalizeEmail(email);
      return statusByEmail.get(normalized) ?? "SUBSCRIBED";
    };

    const firmaCursor = firmas.find(
      {},
      {
        projection: {
          e_mail: 1,
          prijavljeni: 1,
          updated_at: 1,
          "zaposleni.e_mail": 1,
          "zaposleni.prijavljeni": 1,
        },
      },
    );
    for await (const firma of firmaCursor) {
      const filter: Record<string, unknown> = { _id: firma._id };
      if (firma.updated_at !== undefined) filter.updated_at = firma.updated_at;

      const set: Record<string, unknown> = {
        mailing_status: statusFor(firma.e_mail),
      };
      const unset: Record<string, ""> = {};

      if (
        typeof firma.e_mail === "string" &&
        firma.e_mail.trim() !== firma.e_mail
      ) {
        set.e_mail = firma.e_mail.trim();
      }
      if (Object.hasOwn(firma, "prijavljeni")) unset.prijavljeni = "";

      firma.zaposleni?.forEach(
        (z: { e_mail?: unknown; prijavljeni?: unknown }, index: number) => {
          const prefix = `zaposleni.${index}`;
          set[`${prefix}.mailing_status`] = statusFor(z.e_mail);
          if (typeof z.e_mail === "string" && z.e_mail.trim() !== z.e_mail) {
            set[`${prefix}.e_mail`] = z.e_mail.trim();
          }
          if (Object.hasOwn(z, "prijavljeni")) {
            unset[`${prefix}.prijavljeni`] = "";
          }
        },
      );

      firmaOps.push({
        updateOne: {
          filter,
          update: {
            $set: set,
            ...(Object.keys(unset).length > 0 ? { $unset: unset } : {}),
          },
        },
      });
      if (firmaOps.length >= CHUNK_SIZE) await flushFirmas();
    }
    await flushFirmas();

    console.log(
      `Migration completed: ${rowsAdded} legacy unsubscribes added, ${statusByEmail.size} suppressions loaded, ${migrated} firme migrated.`,
    );
    if (invalidEmailFirme.size > 0) {
      console.warn(
        `${invalidEmailFirme.size} firme have a legacy unsubscribe with an invalid email (fix by hand): ${[...invalidEmailFirme].join(", ")}`,
      );
    }
  } catch (error) {
    console.error("Error migrating prijavljeni to mailing_status:", error);
    throw error;
  }
};
