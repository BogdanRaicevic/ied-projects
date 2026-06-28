import type { SeminarQueryParams } from "ied-shared";
import type { QueryFilter } from "mongoose";
import type { SeminarType } from "../models/seminar.model";

export function createSeminarQuery(
  params: SeminarQueryParams,
): QueryFilter<SeminarType> {
  const query: QueryFilter<SeminarType> = {};

  if (params?.naziv && params.naziv.length > 0) {
    query.naziv = { $regex: params.naziv, $options: "i" }; // Case-insensitive partial match
  }

  if (params?.lokacija && params.lokacija.length > 0) {
    query.lokacija = { $regex: params.lokacija, $options: "i" }; // Case-insensitive partial match
  }

  if (params?.predavac && params.predavac.length > 0) {
    query.predavac = { $regex: params.predavac, $options: "i" }; // Case-insensitive partial match
  }

  if (params?.datumOd || params?.datumDo) {
    const range: { $gte?: Date; $lte?: Date } = {};
    if (params.datumOd) {
      range.$gte = params.datumOd;
    }
    if (params.datumDo) {
      range.$lte = params.datumDo;
    }
    // Match if the legacy datum is in range OR any date in datumi is in range
    query.$or = [{ datum: range }, { datumi: { $elemMatch: range } }];
  }

  if (params?.tipSeminara && params.tipSeminara.length > 0) {
    query.tipSeminara = { $in: params.tipSeminara };
  }

  return query;
}
