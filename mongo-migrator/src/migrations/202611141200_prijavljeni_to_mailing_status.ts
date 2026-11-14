import type { Connection } from "mongoose";

// prijavljeni (boolean) → mailing_status, derived from email_suppressions
// (the only source of truth): a contact's status is its email's reason, else
// SUBSCRIBED. Trims contact emails first. Legacy prijavljeni=false is first added to the list as
// UNSUBSCRIBED, so a later recompute keeps it. Contacts store e_mail as typed,
// the list stores it lowercase, hence the case-insensitive collation.
// Re-run safe: step 1 is insert-only and finds nothing once prijavljeni is
// gone; steps 2–3 recompute the same result from the list.
const CHUNK_SIZE = 500;
const CASE_INSENSITIVE = { locale: "en", strength: 2 };
const NO_EMAIL = [null, ""];
const HAS_ZAPOSLENI = { "zaposleni.0": { $exists: true } };

export const up = async (db: Connection) => {
  try {
    const firmas = db.collection("firmas");
    const suppressions = db.collection("email_suppressions");

    // 0. Trim e_mail: collation ignores case, not whitespace, so " a@b.rs "
    // would never match its row (new writes are already trimmed).
    const EDGE_SPACE = /^\s|\s$/;
    await firmas.updateMany({ e_mail: EDGE_SPACE }, [
      { $set: { e_mail: { $trim: { input: "$e_mail" } } } },
    ]);
    await firmas.updateMany({ "zaposleni.e_mail": EDGE_SPACE }, [
      {
        $set: {
          zaposleni: {
            $map: {
              input: "$zaposleni",
              in: {
                $cond: [
                  { $eq: [{ $type: "$$this.e_mail" }, "string"] },
                  {
                    $mergeObjects: [
                      "$$this",
                      { e_mail: { $trim: { input: "$$this.e_mail" } } },
                    ],
                  },
                  "$$this",
                ],
              },
            },
          },
        },
      },
    ]);

    // 1. Legacy unsubscribes → list (never overwrites an existing reason).
    const legacyEmails = new Set<string>();
    const addEmail = (email: unknown) => {
      const normalized =
        typeof email === "string" ? email.trim().toLowerCase() : "";
      if (normalized) legacyEmails.add(normalized);
    };
    const cursor = firmas.find(
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
    for await (const firma of cursor) {
      if (firma.prijavljeni === false) addEmail(firma.e_mail);
      for (const z of firma.zaposleni ?? []) {
        if (z.prijavljeni === false) addEmail(z.e_mail);
      }
    }
    const emails = [...legacyEmails];
    let rowsAdded = 0;
    for (let i = 0; i < emails.length; i += CHUNK_SIZE) {
      const result = await suppressions.bulkWrite(
        emails.slice(i, i + CHUNK_SIZE).map((email) => ({
          updateOne: {
            filter: { email },
            update: { $setOnInsert: { reason: "UNSUBSCRIBED" } },
            upsert: true,
          },
        })),
        { ordered: false },
      );
      rowsAdded += result.upsertedCount;
    }

    // 2. Baseline. With an email: SUBSCRIBED (step 3 sets the list's reason).
    // Without: legacy false → UNSUBSCRIBED (no row possible), else SUBSCRIBED;
    // once prijavljeni is gone, their status is left alone.
    await firmas.updateMany(
      { e_mail: { $nin: NO_EMAIL } },
      { $set: { mailing_status: "SUBSCRIBED" } },
    );
    await firmas.updateMany(
      { e_mail: { $in: NO_EMAIL }, prijavljeni: false },
      { $set: { mailing_status: "UNSUBSCRIBED" } },
    );
    await firmas.updateMany(
      { mailing_status: { $exists: false } },
      { $set: { mailing_status: "SUBSCRIBED" } },
    );
    await firmas.updateMany(
      HAS_ZAPOSLENI,
      {
        $set: { "zaposleni.$[z].mailing_status": "SUBSCRIBED" },
      },
      { arrayFilters: [{ "z.e_mail": { $nin: NO_EMAIL } }] },
    );
    await firmas.updateMany(
      HAS_ZAPOSLENI,
      {
        $set: { "zaposleni.$[z].mailing_status": "UNSUBSCRIBED" },
      },
      {
        arrayFilters: [
          { "z.e_mail": { $in: NO_EMAIL }, "z.prijavljeni": false },
        ],
      },
    );
    await firmas.updateMany(
      HAS_ZAPOSLENI,
      {
        $set: { "zaposleni.$[z].mailing_status": "SUBSCRIBED" },
      },
      { arrayFilters: [{ "z.mailing_status": { $exists: false } }] },
    );

    // 3. Every email on the list → its reason on matching contacts.
    const rows = await suppressions
      .find({}, { projection: { email: 1, reason: 1 } })
      .toArray();
    for (const reason of new Set(rows.map((r) => r.reason))) {
      const reasonEmails = rows
        .filter((r) => r.reason === reason)
        .map((r) => r.email);
      for (let i = 0; i < reasonEmails.length; i += CHUNK_SIZE) {
        const chunk = reasonEmails.slice(i, i + CHUNK_SIZE);
        await firmas.updateMany(
          { e_mail: { $in: chunk } },
          { $set: { mailing_status: reason } },
          { collation: CASE_INSENSITIVE },
        );
        await firmas.updateMany(
          { "zaposleni.e_mail": { $in: chunk } },
          { $set: { "zaposleni.$[z].mailing_status": reason } },
          {
            arrayFilters: [{ "z.e_mail": { $in: chunk } }],
            collation: CASE_INSENSITIVE,
          },
        );
      }
    }

    // 4. Drop the old field.
    await firmas.updateMany(
      { prijavljeni: { $exists: true } },
      { $unset: { prijavljeni: "" } },
    );
    await firmas.updateMany(
      { "zaposleni.prijavljeni": { $exists: true } },
      { $unset: { "zaposleni.$[].prijavljeni": "" } },
    );

    console.log(
      `Migration completed: ${rowsAdded} legacy unsubscribes added to email_suppressions, ${rows.length} suppressed emails applied to mailing_status.`,
    );
  } catch (error) {
    console.error("Error migrating prijavljeni to mailing_status:", error);
    throw error;
  }
};
