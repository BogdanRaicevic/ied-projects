import type {
  ExtendedSearchSeminarType,
  FirmaSeminarSearchParams,
  PrijavaZodType,
  SeminarZodType,
} from "@ied-shared/types/seminar.zod";
import { type PipelineStage, Types } from "mongoose";
import { Firma } from "../models/firma.model";
import {
  type PrijavaType,
  Seminar,
  type SeminarType,
} from "./../models/seminar.model";
import { createSeminarQuery } from "../utils/seminariQueryBuilder";
import { validateMongoId } from "../utils/utils";

export const createSeminar = async (
  seminarData: SeminarZodType,
): Promise<SeminarType> => {
  const dataToSave = prepareSeminarData(seminarData);
  const seminar = new Seminar(dataToSave);
  return (await seminar.save()).toObject();
};

export const updateSeminar = async (
  id: string,
  seminarData: SeminarZodType,
): Promise<SeminarType> => {
  validateMongoId(id);

  const dataToUpdate = prepareSeminarData(seminarData);

  const updatedSeminar = await Seminar.findByIdAndUpdate(id, dataToUpdate, {
    new: true,
  }).lean();

  if (!updatedSeminar) {
    throw new Error("Seminar not found");
  }
  return updatedSeminar;
};

export const searchSeminars = async (qq: ExtendedSearchSeminarType) => {
  const { pageIndex = 0, pageSize = 50, ...filters } = qq;

  const skip = pageIndex * pageSize;
  const mongoQuery = createSeminarQuery(filters);

  const totalDocuments = await Seminar.countDocuments(mongoQuery);

  return {
    courser: Seminar.find(mongoQuery, { zaposleni: 0 })
      .sort({ datum: -1 })
      .skip(skip)
      .limit(pageSize)
      .cursor(),
    totalDocuments,
    totalPages: Math.ceil(totalDocuments / pageSize),
  };
};

export const getSeminarById = async (id: string) => {
  validateMongoId(id);

  const seminar = await Seminar.findById(id).lean();
  if (!seminar) {
    throw new Error("Seminar not found");
  }

  return seminar;
};

export const getAllSeminars = async () => {
  return await Seminar.find({}, { naziv: 1, datum: 1, _id: 1 }).lean();
};

export const createPrijava = async (
  seminar_id: string,
  prijava: PrijavaZodType,
) => {
  validateMongoId(seminar_id);
  validateMongoId(prijava.zaposleni_id);
  validateMongoId(prijava.firma_id);

  const trasnformedPrijava = transformPrijavaToDb(prijava as PrijavaZodType);

  const seminar = await Seminar.findById(seminar_id);
  if (!seminar) {
    throw new Error("Seminar not found");
  }

  // Verify zaposleni exists in firma
  const firma = await Firma.findOne({
    "zaposleni._id": { $eq: trasnformedPrijava.zaposleni_id },
  }).lean();

  if (!firma) {
    throw new Error("Zaposleni not found in any firma");
  }

  // Atomically find the seminar and push the new prijava if the zaposleni is not already registered
  const updatedSeminar = await Seminar.findOneAndUpdate(
    {
      _id: seminar_id,
      "prijave.zaposleni_id": { $ne: trasnformedPrijava.zaposleni_id },
    },
    { $push: { prijave: trasnformedPrijava } },
    { new: true },
  ).lean();

  return updatedSeminar;
};

export const updatePrijava = async (
  seminar_id: string,
  prijava: PrijavaZodType,
) => {
  if (!prijava._id) {
    throw new Error("Prijava ID is required for an update.");
  }
  validateMongoId(seminar_id);
  validateMongoId(prijava._id);

  const trasnformedPrijava = transformPrijavaToDb(prijava as PrijavaZodType);

  const updatedSeminar = await Seminar.findOneAndUpdate(
    { _id: seminar_id, "prijave._id": trasnformedPrijava._id },
    { $set: { "prijave.$": trasnformedPrijava } },
    { new: true },
  ).lean();

  return updatedSeminar;
};

export const deletePrijava = async (
  zaposleni_id: string,
  seminar_id: string,
) => {
  const updatedSeminar = await Seminar.findOneAndUpdate(
    { _id: seminar_id, "prijave.zaposleni_id": zaposleni_id },
    { $pull: { prijave: { zaposleni_id } } },
    { new: true },
  ).lean();

  return updatedSeminar;
};

export const deleteSeminar = async (id: string) => {
  validateMongoId(id);
  const seminar = await Seminar.findOneAndDelete({ _id: id }).lean();

  return seminar;
};

export const getZaposleniIdsFromSeminars = async (
  seminarIds: string[],
): Promise<string[]> => {
  if (seminarIds.length > 0) {
    const seminars = await Seminar.find(
      { _id: { $in: seminarIds } },
      { "prijave.zaposleni_id": 1 },
    ).lean();

    return seminars.flatMap((s) =>
      s.prijave.map((p) => p.zaposleni_id.toString()),
    );
  }
  return [];
};

// TODO: add indexes to optimize aggregation performance
export const searchFirmaSeminars = async (
  pageIndex: number = 0,
  pageSize: number = 50,
  queryParams: FirmaSeminarSearchParams,
) => {
  const skip = pageIndex * pageSize;

  const pipeline: PipelineStage[] = generateSeminarPipeline(
    skip,
    pageSize,
    queryParams,
  );

  const aggregationResult = await Seminar.aggregate(pipeline);
  const data = aggregationResult[0]?.data ?? [];
  const totalDocuments = aggregationResult[0]?.totalDocuments?.[0]?.count
    ? aggregationResult[0].totalDocuments[0].count
    : 0;

  return {
    firmas: data,
    totalDocuments,
    totalPages: Math.ceil(totalDocuments / pageSize),
  };
};

const transformPrijavaToDb = (prijava: PrijavaZodType): PrijavaType => {
  return {
    ...prijava,
    firma_id: new Types.ObjectId(prijava.firma_id),
    zaposleni_id: new Types.ObjectId(prijava.zaposleni_id),
    _id: prijava._id ? new Types.ObjectId(prijava._id) : undefined,
  } as PrijavaType;
};

const prepareSeminarData = (seminarData: SeminarZodType) => {
  const transformedPrijave = (seminarData.prijave || []).map((prijava) =>
    transformPrijavaToDb(prijava as PrijavaZodType),
  );

  return {
    ...seminarData,
    prijave: transformedPrijave,
  };
};

const generateSeminarPipeline = (
  skip: number,
  pageSize: number,
  queryParams: FirmaSeminarSearchParams,
): PipelineStage[] => {
  const matchStages: PipelineStage.Match[] = [];

  const seminarMatch: any = {};
  if (queryParams.nazivSeminara) {
    seminarMatch.naziv = { $regex: queryParams.nazivSeminara, $options: "i" };
  }

  if (queryParams.predavac) {
    seminarMatch.predavac = { $regex: queryParams.predavac, $options: "i" };
  }

  if (Object.keys(seminarMatch).length > 0) {
    matchStages.push({ $match: seminarMatch });
  }

  return [
    ...matchStages,
    { $unwind: "$prijave" },

    // Per (firma, seminar) counts
    {
      $group: {
        _id: {
          firma_id: "$prijave.firma_id",
          seminar_id: "$_id",
        },
        naziv: { $first: "$naziv" },
        predavac: { $first: "$predavac" },
        onlineCena: { $first: "$onlineCena" },
        offlineCena: { $first: "$offlineCena" },
        datum: { $first: "$datum" },
        totalUcesniciSeminar: { $sum: 1 },
        onlineUcesniciSeminar: {
          $sum: { $cond: [{ $eq: ["$prijave.prisustvo", "online"] }, 1, 0] },
        },
        offlineUcesniciSeminar: {
          $sum: { $cond: [{ $eq: ["$prijave.prisustvo", "offline"] }, 1, 0] },
        },
      },
    },

    // Optional sort of seminars inside each firma
    { $sort: { datum: -1 } },

    // Re-group by firma, push seminar objects
    {
      $group: {
        _id: "$_id.firma_id",
        seminars: {
          $push: {
            seminar_id: "$_id.seminar_id",
            naziv: "$naziv",
            predavac: "$predavac",
            lokacija: "$lokacija",
            onlineCena: "$onlineCena",
            offlineCena: "$offlineCena",
            datum: "$datum",
            totalUcesnici: "$totalUcesniciSeminar",
            onlineUcesnici: "$onlineUcesniciSeminar",
            offlineUcesnici: "$offlineUcesniciSeminar",
          },
        },
        brojSeminara: { $sum: 1 },
        totalUcesnici: { $sum: "$totalUcesniciSeminar" },
        onlineUcesnici: { $sum: "$onlineUcesniciSeminar" },
        offlineUcesnici: { $sum: "$offlineUcesniciSeminar" },
      },
    },

    // Join firma metadata
    {
      $lookup: {
        from: "firmas",
        localField: "_id",
        foreignField: "_id",
        as: "firma",
      },
    },
    { $unwind: { path: "$firma", preserveNullAndEmptyArrays: true } },

    // Match firma filters AFTER lookup
    ...buildFirmaMatchStage(queryParams),

    // Final shape
    {
      $project: {
        _id: 0,
        firmaId: "$_id",
        naziv: "$firma.naziv_firme",
        email: "$firma.e_mail",
        mesto: "$firma.mesto",
        tipFirme: "$firma.tip_firme",
        delatnost: "$firma.delatnost",
        brojSeminara: 1,
        totalUcesnici: 1,
        onlineUcesnici: 1,
        offlineUcesnici: 1,
        seminars: 1,
      },
    },
    { $sort: { totalUcesnici: -1, naziv: 1 } },
    {
      $facet: {
        data: [{ $skip: skip }, { $limit: pageSize }],
        totalDocuments: [{ $count: "count" }],
      },
    },
  ];
};

// Helper function to build firma match conditions
const buildFirmaMatchStage = (
  queryParams: FirmaSeminarSearchParams,
): PipelineStage[] => {
  const firmaMatch: any = {};

  if (queryParams.nazivFirme) {
    firmaMatch["firma.naziv_firme"] = {
      $regex: queryParams.nazivFirme,
      $options: "i",
    };
  }

  if (queryParams.tipFirme && queryParams.tipFirme.length > 0) {
    firmaMatch["firma.tip_firme"] = { $in: queryParams.tipFirme };
  }

  if (queryParams.delatnost && queryParams.delatnost.length > 0) {
    firmaMatch["firma.delatnost"] = { $in: queryParams.delatnost };
  }

  if (queryParams.velicineFirme && queryParams.velicineFirme.length > 0) {
    firmaMatch["firma.velicina_firme"] = { $in: queryParams.velicineFirme };
  }

  if (queryParams.radnaMesta && queryParams.radnaMesta.length > 0) {
    // If you need to filter by radna mesta, you'll need another lookup to zaposleni
    // This is more complex and depends on your data structure
  }

  return Object.keys(firmaMatch).length > 0 ? [{ $match: firmaMatch }] : [];
};
