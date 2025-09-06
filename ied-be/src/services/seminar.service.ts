import type {
  ExtendedSearchSeminarType,
  PrijavaZodType,
  SeminarZodType,
} from "@ied-shared/types/seminar.zod";
import { Types } from "mongoose";
import { Firma } from "../models/firma.model";
import {
  type PrijavaType,
  Seminar,
  type SeminarType,
} from "./../models/seminar.model";
import { ErrorWithCause } from "../utils/customErrors";
import { createSeminarQuery } from "../utils/seminariQueryBuilder";
import { validateMongoId } from "../utils/utils";

export const saveSeminar = async (
  seminarData: SeminarZodType,
): Promise<SeminarType> => {
  if (seminarData._id) {
    validateMongoId(seminarData._id);

    seminarData.prijave.forEach((prijava) => {
      transformPrijavaToDb(prijava as PrijavaZodType);
    });

    const updatedSeminar = await Seminar.findOneAndUpdate(
      { _id: { $eq: seminarData._id } },
      seminarData,
      { new: true },
    ).lean();

    if (!updatedSeminar) {
      throw new Error("Seminar not found");
    }
    return updatedSeminar;
  }

  const seminar = new Seminar(seminarData);
  return (await seminar.save()).toObject();
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

const transformPrijavaToDb = (prijava: PrijavaZodType): PrijavaType => {
  return {
    ...prijava,
    firma_id: new Types.ObjectId(prijava.firma_id),
    zaposleni_id: new Types.ObjectId(prijava.zaposleni_id),
    _id: prijava._id ? new Types.ObjectId(prijava._id) : undefined,
  } as PrijavaType;
};
