import type {
  ExtendedSearchSeminarType,
  FirmaSeminarSearchParams,
  PrijavaZodType,
  SeminarZodType,
} from "ied-shared";
import { type PipelineStage, type QueryFilter, Types } from "mongoose";
import { Firma } from "../models/firma.model";
import { RacunBaseModel, type RacunBaseType } from "../models/racun.model";
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

  if (seminarData.tipSeminara === "") {
    (dataToUpdate as any).$unset = { tipSeminara: 1 };
  }

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
  // Step 1: Query and filter Firma collection
  const firmaQuery = buildFirmaQuery(queryParams);
  const allMatchingFirmas = await Firma.find(firmaQuery, {
    _id: 1,
    naziv_firme: 1,
    e_mail: 1,
    mesto: 1,
    tip_firme: 1,
    delatnost: 1,
  }).lean();

  if (allMatchingFirmas.length === 0) {
    return {
      firmas: [],
      totalDocuments: 0,
      totalPages: 0,
    };
  }

  const firmaIds = allMatchingFirmas.map((f) => f._id as Types.ObjectId);

  // Step 2: Aggregate seminars for these firmas
  const seminarAggregation = await aggregateSeminarsByFirma(
    firmaIds,
    queryParams,
  );

  // Step 2.5: Fetch racuni for all firma-seminar pairs
  const racuniMap = await fetchRacuniForSeminars(seminarAggregation);

  // Step 3: Join firma metadata with seminar aggregations in TypeScript
  const firmaMap = new Map(allMatchingFirmas.map((f) => [f._id.toString(), f]));

  const enrichedData = seminarAggregation
    .map((aggData) => {
      const firma = firmaMap.get(aggData.firmaId.toString());
      if (!firma) return null;

      // Enrich each seminar with ukupnaNaknada from racuni
      const enrichedSeminars = aggData.seminars.map((seminar) => {
        const racunKey = `${aggData.firmaId.toString()}_${seminar.seminar_id.toString()}`;
        let ukupnaNaknada = racuniMap.get(racunKey) ?? null;

        // If no racun exists, calculate from participant counts and prices
        if (ukupnaNaknada === null) {
          const onlineTotal =
            (seminar.onlineCena ?? 0) * (seminar.onlineUcesnici ?? 0);
          const offlineTotal =
            (seminar.offlineCena ?? 0) * (seminar.offlineUcesnici ?? 0);
          ukupnaNaknada = onlineTotal + offlineTotal;
        }

        return {
          ...seminar,
          ukupnaNaknada,
        };
      });

      return {
        firmaId: aggData.firmaId,
        naziv: firma.naziv_firme,
        email: firma.e_mail,
        mesto: firma.mesto,
        tipFirme: firma.tip_firme,
        delatnost: firma.delatnost,
        brojSeminara: aggData.seminars.length,
        totalUcesnici: aggData.totalUcesnici,
        onlineUcesnici: aggData.onlineUcesnici,
        offlineUcesnici: aggData.offlineUcesnici,
        seminars: enrichedSeminars,
      };
    })
    .filter((item) => item !== null);

  // Step 4: Sort by totalUcesnici (descending) and naziv (ascending)
  enrichedData.sort((a, b) => {
    if (b.totalUcesnici !== a.totalUcesnici) {
      return b.totalUcesnici - a.totalUcesnici;
    }
    return (a.naziv || "").localeCompare(b.naziv || "");
  });

  // Step 5: Paginate
  const totalDocuments = enrichedData.length;
  const skip = pageIndex * pageSize;
  const paginatedData = enrichedData.slice(skip, skip + pageSize);

  return {
    firmas: paginatedData,
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
  const { tipSeminara, ...rest } = seminarData;

  const transformedPrijave = (seminarData.prijave || []).map((prijava) =>
    transformPrijavaToDb(prijava as PrijavaZodType),
  );

  const data: any = {
    ...rest,
    prijave: transformedPrijave,
  };

  if (tipSeminara) {
    data.tipSeminara = Types.ObjectId.createFromHexString(tipSeminara);
  }

  return data;
};

// Helper: Build Firma query from search params
const buildFirmaQuery = (queryParams: FirmaSeminarSearchParams) => {
  const query: any = {};

  if (queryParams.nazivFirme) {
    query.naziv_firme = { $regex: queryParams.nazivFirme, $options: "i" };
  }

  if (queryParams.tipFirme && queryParams.tipFirme.length > 0) {
    query.tip_firme = { $in: queryParams.tipFirme };
  }

  if (queryParams.delatnost && queryParams.delatnost.length > 0) {
    query.delatnost = { $in: queryParams.delatnost };
  }

  if (queryParams.velicineFirme && queryParams.velicineFirme.length > 0) {
    query.velicina_firme = { $in: queryParams.velicineFirme };
  }

  // Note: radnaMesta filtering would require a more complex approach
  // involving nested document queries on zaposleni array

  return query;
};

// Helper: Aggregate seminars by firma
const aggregateSeminarsByFirma = async (
  firmaIds: Types.ObjectId[],
  queryParams: FirmaSeminarSearchParams,
) => {
  const pipeline: PipelineStage[] = [];

  // Match seminars based on filters
  const seminarMatch: any = {};
  if (queryParams.nazivSeminara) {
    seminarMatch.naziv = { $regex: queryParams.nazivSeminara, $options: "i" };
  }
  if (queryParams.predavac) {
    seminarMatch.predavac = { $regex: queryParams.predavac, $options: "i" };
  }

  if (queryParams.tipSeminara && queryParams.tipSeminara.length > 0) {
    seminarMatch.tipSeminara = {
      $in: queryParams.tipSeminara.map((id) =>
        Types.ObjectId.createFromHexString(id),
      ),
    };
  }

  if (queryParams.datumOd || queryParams.datumDo) {
    seminarMatch.datum = {};
    if (queryParams.datumOd) {
      seminarMatch.datum.$gte = new Date(queryParams.datumOd);
    }
    if (queryParams.datumDo) {
      seminarMatch.datum.$lte = new Date(queryParams.datumDo);
    }
  }

  if (Object.keys(seminarMatch).length > 0) {
    pipeline.push({ $match: seminarMatch });
  }

  // Unwind prijave and filter by firma IDs
  pipeline.push(
    { $unwind: "$prijave" },
    {
      $match: {
        "prijave.firma_id": { $in: firmaIds },
      },
    },
  );

  // Group by (firma, seminar) to calculate counts per seminar
  pipeline.push({
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
      lokacija: { $first: "$lokacija" },
      totalUcesniciSeminar: { $sum: 1 },
      onlineUcesniciSeminar: {
        $sum: { $cond: [{ $eq: ["$prijave.prisustvo", "online"] }, 1, 0] },
      },
      offlineUcesniciSeminar: {
        $sum: { $cond: [{ $eq: ["$prijave.prisustvo", "offline"] }, 1, 0] },
      },
    },
  });

  // Sort seminars by date
  pipeline.push({ $sort: { datum: -1 } });

  // Group by firma and collect seminars
  pipeline.push({
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
      totalUcesnici: { $sum: "$totalUcesniciSeminar" },
      onlineUcesnici: { $sum: "$onlineUcesniciSeminar" },
      offlineUcesnici: { $sum: "$offlineUcesniciSeminar" },
    },
  });

  // Project final shape
  pipeline.push({
    $project: {
      _id: 0,
      firmaId: "$_id",
      seminars: 1,
      totalUcesnici: 1,
      onlineUcesnici: 1,
      offlineUcesnici: 1,
    },
  });

  return await Seminar.aggregate(pipeline);
};

// Helper: Fetch racuni for firma-seminar pairs with priority logic
const fetchRacuniForSeminars = async (
  seminarAggregation: any[],
): Promise<Map<string, number>> => {
  // Extract all firma-seminar pairs
  const firmaSeminarPairs: Array<{
    firma_id: Types.ObjectId;
    seminar_id: Types.ObjectId;
  }> = [];

  for (const aggData of seminarAggregation) {
    for (const seminar of aggData.seminars) {
      firmaSeminarPairs.push({
        firma_id: aggData.firmaId,
        seminar_id: seminar.seminar_id,
      });
    }
  }

  if (firmaSeminarPairs.length === 0) {
    return new Map();
  }

  // Fetch all relevant racuni (predracun and konacniRacun types)
  const racunFilter: QueryFilter<RacunBaseType> = {
    tipRacuna: { $in: ["predracun", "konacniRacun"] },
    "primalacRacuna.firma_id": {
      $in: firmaSeminarPairs.map((p) => p.firma_id),
    },
    "seminar.seminar_id": {
      $in: firmaSeminarPairs.map((p) => p.seminar_id),
    },
  };

  const racuni = await RacunBaseModel.find(racunFilter).lean();

  // Build map: first racun found wins, no overwriting
  const racuniMap = new Map<string, number>();

  for (const racun of racuni) {
    if (
      racun.primalacRacuna?.firma_id &&
      racun.seminar?.seminar_id &&
      (racun as any).calculations?.ukupnaNaknada != null
    ) {
      const key = `${racun.primalacRacuna.firma_id.toString()}_${racun.seminar.seminar_id.toString()}`;

      // Only set if not already present
      if (!racuniMap.has(key)) {
        racuniMap.set(key, (racun as any).calculations.ukupnaNaknada);
      }
    }
  }

  return racuniMap;
};
