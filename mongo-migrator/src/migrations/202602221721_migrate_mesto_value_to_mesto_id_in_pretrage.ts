import type { Connection } from "mongoose";

export const up = async (db: Connection) => {
  try {
    const mestaCollection = db.collection("mesta");
    const pretrageCollection = db.collection("pretrage");

    const allMesta = (await mestaCollection.find({}).toArray()).map((m) => ({
      mesto_id: m._id,
      naziv_mesto: m.naziv_mesto,
    }));

    const allPretrage = (await pretrageCollection.find({}).toArray()).map(
      (p) => ({
        pretrage_id: p._id,
        mesta: p.mesta,
      }),
    );

    const bulkOps: any[] = [];

    for (const pretrage of allPretrage) {
      const mestaIds = pretrage.mesta
        .map(
          (m: string) =>
            allMesta.find((me: any) => me.naziv_mesto === m)?.mesto_id,
        )
        .filter(Boolean);

      bulkOps.push({
        updateOne: {
          filter: { _id: pretrage.pretrage_id },
          update: { $set: { mesta: mestaIds } },
        },
      });
    }

    if (bulkOps.length > 0) {
      const res = await pretrageCollection.bulkWrite(bulkOps, {
        ordered: false,
      });
      console.log(
        `[MIGRATION] Updated ${res.modifiedCount} pretrage (matched: ${res.matchedCount}).`,
      );
    } else {
      console.log("[MIGRATION] No pretrage needed updates.");
    }
  } catch (error) {
    console.error(
      "Error during migration of mesto value to mesto id in pretrage:",
      error,
    );
    throw error;
  }
};
