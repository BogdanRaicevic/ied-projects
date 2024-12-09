import { FilterQuery } from "mongoose";
import { createSeminarQuery, SeminarQueryParams } from "../utils/seminariQueryBuilder";
import { Seminar } from "./../models/seminar.model";

export const saveSeminar = async ({
  naziv,
  predavac,
  lokacija,
  cena,
  datum,
}: {
  naziv: string;
  predavac?: string;
  lokacija?: string;
  cena?: string;
  datum?: string;
}) => {
  try {
    if (!naziv) {
      console.log("Seminar must contain a have name");
      return;
    }
    await Seminar.create({ naziv, predavac, lokacija, cena, datum });
    console.log("Created seminar:", naziv, predavac, lokacija, cena, datum);
  } catch (error) {
    console.log("Error saving seminar", error);
    throw new Error("Error saving seminar");
  }
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
