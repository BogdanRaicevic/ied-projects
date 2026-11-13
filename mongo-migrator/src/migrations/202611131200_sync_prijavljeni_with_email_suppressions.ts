import type { Connection } from "mongoose";

// Every email on the suppression list ⇒ every firma and zaposleni with that
// email gets prijavljeni=false. Uploads used to write only the suppression
// row. Contacts store e_mail as typed, the list stores it lowercase, hence
// the case-insensitive collation. Idempotent: re-running sets false again.
const CHUNK_SIZE = 500;
const CASE_INSENSITIVE = { locale: "en", strength: 2 };

export const up = async (db: Connection) => {
  try {
    const firmas = db.collection("firmas");
    const emails: string[] = await db
      .collection("email_suppressions")
      .distinct("email");

    let firmeModified = 0;
    let zaposleniFirmeModified = 0;

    for (let i = 0; i < emails.length; i += CHUNK_SIZE) {
      const chunk = emails.slice(i, i + CHUNK_SIZE);

      const firmeResult = await firmas.updateMany(
        { e_mail: { $in: chunk }, prijavljeni: { $ne: false } },
        { $set: { prijavljeni: false } },
        { collation: CASE_INSENSITIVE },
      );
      const zaposleniResult = await firmas.updateMany(
        { "zaposleni.e_mail": { $in: chunk } },
        { $set: { "zaposleni.$[z].prijavljeni": false } },
        {
          arrayFilters: [{ "z.e_mail": { $in: chunk } }],
          collation: CASE_INSENSITIVE,
        },
      );

      firmeModified += firmeResult.modifiedCount;
      zaposleniFirmeModified += zaposleniResult.modifiedCount;
    }

    console.log(
      `Migration completed: ${emails.length} suppressed emails, ${firmeModified} firme and zaposleni in ${zaposleniFirmeModified} firme set to prijavljeni=false.`,
    );
  } catch (error) {
    console.error("Error syncing prijavljeni with email suppressions:", error);
    throw error;
  }
};
