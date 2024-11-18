import { FilterQuery } from "mongoose";
import { SeminarType } from "../models/seminar.model";

export type FirmaQueryParams = {
  naziv?: string;
  lokacija?: string;
  predavac?: string;
  datumOd?: string;
  datumDo?: string;
  datum?: string;
};

export function createSeminarQuery(params: FirmaQueryParams): FilterQuery<SeminarType> {
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
      $gte: new Date(params.datumOd),
      $lte: new Date(params.datumDo),
    };
  } else if (params?.datumOd) {
    query.datum = { $gte: new Date(params.datumOd) };
  } else if (params?.datumDo) {
    query.datum = { $lte: new Date(params.datumDo) };
  }
  console.log("Generated MongoDB query date:", query);
  return query;
}
