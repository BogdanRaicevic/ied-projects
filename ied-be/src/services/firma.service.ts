import {
  type ContactTypeEnum,
  type Email,
  type ExportFirma,
  type ExportZaposlenih,
  NEGACIJA,
  type ParametriPretrage,
  PRIJAVA_STATUS,
} from "ied-shared";
import { Firma, type FirmaType } from "../models/firma.model";
import type { Zaposleni } from "../models/zaposleni.model";
import { createFirmaQuery } from "../queryBuilders/firmaQueryBuilder";
import {
  getSuppressedEmailsSet,
  isEmailSuppressed,
  normalizeEmail,
} from "./email_suppression.service";
import { getZaposleniIdsFromSeminars } from "./seminar.service";

export const findFirmaById = async (id: string): Promise<FirmaType | null> => {
  try {
    return await Firma.findById(id)
      .populate("mesto", "naziv_mesto postanski_broj")
      .lean();
  } catch (error) {
    console.error("Error finding firma by id:", error);
    throw error;
  }
};

export const deleteFirmaById = async (
  id: string,
): Promise<FirmaType | null> => {
  return await Firma.findByIdAndDelete(id).exec();
};

export const create = async (
  firmaData: Partial<FirmaType>,
): Promise<FirmaType> => {
  const isSuppressed = await isEmailSuppressed(firmaData.e_mail);
  if (isSuppressed) {
    firmaData.prijavljeni = false;
  }

  const firma = new Firma(firmaData);
  const doc = await firma.save();
  return doc.toObject({
    virtuals: true,
    versionKey: false,
  });
};

export const updateFirmaById = async (
  id: string,
  firmaData: Partial<FirmaType>,
): Promise<FirmaType | null> => {
  try {
    // A partial update that omits e_mail must still be checked against the
    // firma's actual persisted address, not skip suppression entirely.
    const effectiveEmail =
      firmaData.e_mail !== undefined
        ? firmaData.e_mail
        : (await Firma.findById(id, { e_mail: 1 }).lean())?.e_mail;

    const isSuppressed = await isEmailSuppressed(effectiveEmail);
    if (isSuppressed) {
      firmaData.prijavljeni = false;
    }

    return await Firma.findOneAndUpdate(
      { _id: id },
      { $set: firmaData },
      { returnDocument: "after", runValidators: true },
    ).lean();
  } catch (error) {
    console.error("Error updating firma:", error);
    throw error;
  }
};

export const search = async (
  queryParameters: ParametriPretrage,
  pageIndex = 0,
  pageSize = 50,
) => {
  const skip = pageIndex * pageSize;
  const mongoQuery = await createFirmaQuery(queryParameters);

  const totalDocuments = await Firma.countDocuments(mongoQuery);

  return {
    firmas: await Firma.find(mongoQuery, { zaposleni: 0 })
      .populate("mesto", "naziv_mesto postanski_broj")
      .sort({ naziv_firme: 1 })
      .skip(skip)
      .limit(pageSize),
    totalDocuments,
    totalPages: Math.ceil(totalDocuments / pageSize),
  };
};

const withoutSuppressed = async <T extends { e_mail?: string }>(
  rows: T[],
): Promise<T[]> => {
  const suppressedEmails = await getSuppressedEmailsSet(
    rows.map((r) => r.e_mail ?? ""),
  );
  return rows.filter(
    (r) => !r.e_mail || !suppressedEmails.has(normalizeEmail(r.e_mail)),
  );
};

export const exportSearchedFirmaData = async (
  queryParameters: ParametriPretrage,
): Promise<ExportFirma> => {
  const mongoQuery = await createFirmaQuery(queryParameters);

  const firme = await Firma.find(mongoQuery, {
    naziv_firme: 1,
    e_mail: 1,
    _id: 0,
  }).lean();

  // Rows without an email are kept so the export can list them separately.
  const res: ExportFirma = firme.map((doc) => ({
    naziv_firme: doc.naziv_firme,
    e_mail: doc.e_mail ?? "",
  }));

  return withoutSuppressed(res);
};

export const exportSearchedZaposleniData = async (
  queryParameters: ParametriPretrage,
): Promise<ExportZaposlenih> => {
  const mongoQuery = await createFirmaQuery(queryParameters);

  const seminarAttendees: string[] = await getZaposleniIdsFromSeminars(
    queryParameters.seminari || [],
  );

  if (queryParameters.negacije?.includes(NEGACIJA.radnoMesto)) {
    mongoQuery.zaposleni = {
      $elemMatch: { radno_mesto: { $nin: queryParameters.radnaMesta } }, // TODO: investigate do i need ?? []
    };
  }

  const cursor = Firma.find(mongoQuery, {
    naziv_firme: 1,
    zaposleni: 1,
    _id: 0,
  })
    .lean()
    .cursor();

  const res: ExportZaposlenih = [];

  // Streams firme one at a time: full zaposleni arrays are too big to load at once.
  for await (const doc of cursor) {
    if (doc.zaposleni) {
      for (const z of doc.zaposleni) {
        if (!z._id?.toString()) {
          console.warn("Zaposleni missing _id:", z);
          continue;
        }

        if (
          queryParameters.zaposleniPrijavljeni === PRIJAVA_STATUS.subscribed &&
          z.prijavljeni !== true
        ) {
          continue;
        }

        if (
          queryParameters.zaposleniPrijavljeni ===
            PRIJAVA_STATUS.unsubscribed &&
          z.prijavljeni !== false
        ) {
          continue;
        }

        const isZaposleniInSeminar =
          seminarAttendees?.includes(z._id.toString()) ?? false;
        const isRadnoMestoNegated =
          queryParameters.negacije?.includes(NEGACIJA.radnoMesto) ?? false;
        const isRadnoMestoIncluded =
          queryParameters.radnaMesta?.includes(z.radno_mesto) ?? false;
        const hasNoRadnaMestaFilter =
          !queryParameters.radnaMesta ||
          queryParameters.radnaMesta.length === 0;
        // Skip if zaposleni is not in the specified seminars
        const isNegateSeminar =
          queryParameters.negacije?.includes(NEGACIJA.seminar) ?? false;
        if (
          !isNegateSeminar &&
          queryParameters.seminari &&
          queryParameters.seminari.length > 0 &&
          !isZaposleniInSeminar
        ) {
          continue;
        }

        let shouldAdd = false;
        if (isRadnoMestoNegated && !isRadnoMestoIncluded) {
          shouldAdd = true;
        }

        if (hasNoRadnaMestaFilter || isRadnoMestoIncluded) {
          shouldAdd = true;
        }

        if (shouldAdd) {
          res.push({
            imePrezime: [z.ime, z.prezime].filter(Boolean).join(" "),
            firma_naziv: doc.naziv_firme,
            e_mail: z.e_mail ?? "",
          });
        }
      }
    }
  }

  return withoutSuppressed(res);
};

export const createZaposleni = async (
  firmaId: string,
  zaposleniData: Zaposleni,
) => {
  try {
    if (zaposleniData.radno_mesto === "") {
      zaposleniData.radno_mesto = "nema";
    }

    const isSuppressed = await isEmailSuppressed(zaposleniData.e_mail);
    if (isSuppressed) {
      zaposleniData.prijavljeni = false;
    }

    const updatedFirma = await Firma.findByIdAndUpdate(
      firmaId,
      { $push: { zaposleni: zaposleniData } },
      { returnDocument: "after", runValidators: true },
    ).lean();

    return updatedFirma;
  } catch (error) {
    console.error("Error creating zaposleni:", error);
    throw error;
  }
};

export const updateZaposleni = async (
  firmaId: string,
  zaposleniId: string,
  zaposleniData: Partial<Zaposleni> & { firmaKomentar?: string },
) => {
  try {
    if (zaposleniData.radno_mesto === "") {
      zaposleniData.radno_mesto = "nema";
    }

    const { firmaKomentar, ...zaposleniUpdateData } = zaposleniData;

    // A partial update that omits e_mail must still be checked against the
    // zaposleni's actual persisted address, not skip suppression entirely.
    const effectiveEmail =
      zaposleniData.e_mail !== undefined
        ? zaposleniData.e_mail
        : (
            await Firma.findOne(
              { _id: firmaId, "zaposleni._id": zaposleniId },
              { "zaposleni.$": 1 },
            ).lean()
          )?.zaposleni?.[0]?.e_mail;

    const isSuppressed = await isEmailSuppressed(effectiveEmail);
    if (isSuppressed) {
      zaposleniUpdateData.prijavljeni = false;
    }
    const updateObject: Record<string, unknown> = {};
    for (const key in zaposleniUpdateData) {
      updateObject[`zaposleni.$.${key}`] =
        zaposleniUpdateData[key as keyof typeof zaposleniUpdateData];
    }

    if (firmaKomentar) {
      updateObject["komentar"] = firmaKomentar;
    }

    const updatedFirma = await Firma.findOneAndUpdate(
      { _id: firmaId, "zaposleni._id": zaposleniId },
      { $set: updateObject },
      {
        returnDocument: "after",
        runValidators: true,
      },
    ).lean();

    return updatedFirma;
  } catch (error) {
    console.error("Error updating zaposleni:", error);
    throw error;
  }
};

export const deleteZaposleni = async (firmaId: string, zaposleniId: string) => {
  try {
    const updatedFirma = await Firma.findOneAndUpdate(
      { _id: firmaId, "zaposleni._id": zaposleniId },
      { $pull: { zaposleni: { _id: zaposleniId } } },
      { returnDocument: "after" },
    ).lean();

    return updatedFirma;
  } catch (error) {
    console.error("Error deleting zaposleni:", error);
    throw error;
  }
};

export const updateLastContact = async ({
  firmaId,
  contactType,
  userEmail,
}: {
  firmaId: string;
  contactType: ContactTypeEnum;
  userEmail: Email;
}) => {
  try {
    const updatedFirma = await Firma.findByIdAndUpdate(
      firmaId,
      {
        $push: {
          last_contacted: {
            e_mail: userEmail,
            contact_type: contactType,
            date: new Date(),
          },
        },
      },
      { returnDocument: "after", runValidators: true },
    ).lean();

    return updatedFirma;
  } catch (error) {
    console.error("Error adding last contacted:", error);
    throw error;
  }
};
