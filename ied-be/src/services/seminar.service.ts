import { FilterQuery } from "mongoose";
import { createSeminarQuery } from "../utils/seminariQueryBuilder";
import { Seminar, SeminarType } from "./../models/seminar.model";
import { SeminarQueryParams } from "ied-shared/types/seminar";

export const saveSeminar = async (seminarData: Partial<SeminarType>): Promise<SeminarType> => {
  const seminar = new Seminar(seminarData);
  return await seminar.save();
};

export const search = async (
  queryParameters: FilterQuery<SeminarQueryParams>,
  pageIndex: number = 1,
  pageSize: number = 10
) => {
  const skip = (pageIndex - 1) * pageSize;
  const mongoQuery = createSeminarQuery(queryParameters.queryParameters);

  const totalDocuments = await Seminar.countDocuments(mongoQuery);

  return {
    courser: Seminar.find(mongoQuery, { zaposleni: 0 })
      .sort({ naziv_firme: 1 })
      .skip(skip)
      .limit(pageSize)
      .cursor(),
    totalDocuments,
    totalPages: Math.ceil(totalDocuments / pageSize),
  };
};
