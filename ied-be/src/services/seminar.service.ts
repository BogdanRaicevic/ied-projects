import type { FilterQuery } from "mongoose";
import { createSeminarQuery } from "../utils/seminariQueryBuilder";
import { PrijavaType, Seminar, Types, type SeminarType } from "./../models/seminar.model";
import type {
  PrijavaZodType,
  SeminarQueryParamsZodType,
  SeminarZodType,
} from "@ied-shared/types/seminar";
import { ErrorWithCause } from "../utils/customErrors";
import { validateMongoId } from "../utils/utils";
import { Firma } from "../models/firma.model";

export const saveSeminar = async (seminarData: SeminarZodType): Promise<SeminarType> => {
  if (seminarData._id) {
    validateMongoId(seminarData._id);

    seminarData.prijave.map((prijava) => {
      transformPrijavaToDb(prijava);
    });

    const updatedSeminar = await Seminar.findByIdAndUpdate(seminarData._id, seminarData, {
      new: true,
    });

    if (!updatedSeminar) {
      throw new Error("Seminar not found");
    }
    return updatedSeminar;
  }

  const seminar = new Seminar(seminarData);
  return await seminar.save();
};

export const search = async (
  queryParameters: FilterQuery<SeminarQueryParamsZodType>,
  pageIndex = 1,
  pageSize = 50
) => {
  const skip = (pageIndex - 1) * pageSize;
  const mongoQuery = createSeminarQuery(queryParameters.queryParameters);

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

  const seminar = await Seminar.findById(id);
  if (!seminar) {
    throw new Error("Seminar not found");
  }

  return seminar;
};

export const getAllSeminars = async () => {
  return await Seminar.find({}, { naziv: 1, datum: 1, _id: 1 }).exec();
};

export const savePrijava = async (seminar_id: string, prijava: PrijavaZodType) => {
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
    "zaposleni._id": trasnformedPrijava.zaposleni_id,
  });
  if (!firma) {
    throw new Error("Zaposleni not found in any firma");
  }

  if (
    seminar.prijave.some(
      (p) => p.zaposleni_id.toString() === trasnformedPrijava.zaposleni_id.toString()
    )
  ) {
    throw new ErrorWithCause("Zaposleni je već prijavljen na seminar", "duplicate");
  }

  seminar.prijave.push(trasnformedPrijava);
  return await seminar.save();
};

export const deletePrijava = async (zaposleni_id: string, seminar_id: string) => {
  validateMongoId(seminar_id);
  const seminar = await Seminar.findById(seminar_id);
  if (!seminar) {
    throw new Error("Seminar not found");
  }

  seminar.prijave = seminar.prijave.filter((p) => p.zaposleni_id.toString() !== zaposleni_id);
  return await seminar.save();
};

export const deleteSeminar = async (id: string) => {
  validateMongoId(id);
  const seminar = await Seminar.findOneAndDelete({ _id: id });

  if (!seminar) {
    throw new Error("Seminar not found");
  }

  return seminar;
};

export const getZaposleniIdsFromSeminars = async (seminarIds: string[]): Promise<string[]> => {
  if (seminarIds.length > 0) {
    const seminars = await Seminar.find(
      { _id: { $in: seminarIds } },
      { "prijave.zaposleni_id": 1 }
    );

    return seminars.flatMap((s) => s.prijave.map((p) => p.zaposleni_id.toString()));
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
