import {
  PretrageRacunaZodType,
  RacunQueryZod,
  RacunZod,
} from "@ied-shared/index";
import { FilterQuery } from "mongoose";

export function createRacunQuery(
  params: PretrageRacunaZodType,
): FilterQuery<RacunZod> {
  const query: FilterQuery<RacunZod> = {};

  if (params?.pozivNaBroj) {
    query.pozivNaBroj = { $regex: params.pozivNaBroj, $options: "i" }; // Case-insensitive partial match
  }

  if (
    params?.tipRacuna &&
    Array.isArray(params.tipRacuna) &&
    params.tipRacuna.length > 0
  ) {
    query.tipRacuna = { $in: params.tipRacuna }; // Match any of the values
  }

  if (params?.datumOd && params?.datumDo) {
    query.dateCreatedAt = {
      $gte: params.datumOd,
      $lte: params.datumDo,
    };
  } else if (params?.datumOd) {
    query.dateCreatedAt = { $gte: params.datumOd };
  } else if (params?.datumDo) {
    query.dateCreatedAt = { $lte: params.datumDo };
  }

  if (params?.izdavacRacuna && params.izdavacRacuna.length > 0) {
    query.izdavacRacuna = { $in: params.izdavacRacuna }; // Case-insensitive partial match
  }

  if (params?.imeFirme && params.imeFirme.length > 0) {
    query["primalacRacuna.naziv"] = { $regex: params.imeFirme, $options: "i" }; // Case-insensitive partial match
  }

  if (params?.pibFirme) {
    query["primalacRacuna.pib"] = { $regex: params.pibFirme, $options: "i" }; // Case-insensitive partial match
  }

  if (params?.nazivSeminara) {
    query["seminar.naziv"] = { $regex: params.nazivSeminara, $options: "i" }; // Case-insensitive partial match
  }
  return query;
}
