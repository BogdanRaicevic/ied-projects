import { FilterQuery } from "mongoose";
import { SeminarType } from "../models/seminar.model";

export type FirmaQueryParams = {
  naziv?: string;
  lokacija?: string;
  predavac?: string;
};

export function createSeminarQuery(params: FirmaQueryParams): FilterQuery<SeminarType> {
  const query: FilterQuery<SeminarType> = {};

  if (params.naziv && params.naziv.length > 0) {
    query.naziv = { $regex: params.naziv, $options: "i" }; // Case-insensitive partial match
  }

  if (params.lokacija && params.lokacija.length > 0) {
    query.lokacija = { $regex: params.lokacija, $options: "i" }; // Case-insensitive partial match
  }

  if (params.predavac && params.predavac.length > 0) {
    query.predavac = { $regex: params.predavac, $options: "i" }; // Case-insensitive partial match
  }

  return query;
}
