import { FilterQuery } from "mongoose";
import { SeminarType } from "../models/seminar.model";
import { SeminarQueryParams } from "ied-shared/types/seminarQueryParams";

export function createSeminarQuery(params: SeminarQueryParams): FilterQuery<SeminarType> {
  const query: FilterQuery<SeminarType> = {};

  if (params?.naziv && params.naziv.length > 0) {
    query.naziv = { $regex: params.naziv, $options: "i" }; // Case-insensitive partial match
  }

  if (params?.lokacija && params.lokacija.length > 0) {
    query.lokacija = { $regex: params.lokacija, $options: "i" }; // Case-insensitive partial match
  }

  if (params?.predavac && params.predavac.length > 0) {
    query.predavac = { $regex: params.predavac, $options: "i" }; // Case-insensitive partial match
  }

  if (params?.datumOd && params?.datumDo) {
    query.datum = {
      $gte: params.datumOd, // String comparison works for `yyyy-MM-dd`
      $lte: params.datumDo,
    };
  } else if (params?.datumOd) {
    query.datum = { $gte: params.datumOd };
  } else if (params?.datumDo) {
    query.datum = { $lte: params.datumDo };
  }

  console.log("Generated MongoDB query date:", query);
  return query;
}
