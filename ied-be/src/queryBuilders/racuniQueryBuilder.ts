import type { PretrageRacunaType } from "ied-shared";
import type { QueryFilter } from "mongoose";
import type { RacunBaseType } from "../models/racun.model";
import { escapeRegex, toDateRangeFilter } from "../utils/utils";

export function createRacunQuery(
  params: PretrageRacunaType,
): QueryFilter<RacunBaseType> {
  const query: QueryFilter<RacunBaseType> = {};

  if (params?.pozivNaBroj) {
    query.pozivNaBroj = {
      $regex: escapeRegex(params.pozivNaBroj),
      $options: "i",
    }; // Case-insensitive partial match
  }

  if (
    params?.tipRacuna &&
    Array.isArray(params.tipRacuna) &&
    params.tipRacuna.length > 0
  ) {
    query.tipRacuna = { $in: params.tipRacuna }; // Match any of the values
  }

  const dateRange = toDateRangeFilter(params?.datumOd, params?.datumDo);
  if (dateRange) {
    query.created_at = dateRange;
  }

  if (params?.izdavacRacuna && params.izdavacRacuna.length > 0) {
    query.izdavacRacuna = { $in: params.izdavacRacuna }; // Case-insensitive partial match
  }

  if (params?.imeFirme && params.imeFirme.length > 0) {
    query["primalacRacuna.naziv"] = {
      $regex: escapeRegex(params.imeFirme),
      $options: "i",
    }; // Case-insensitive partial match
  }

  if (params?.pibFirme) {
    query["primalacRacuna.pib"] = {
      $regex: escapeRegex(params.pibFirme),
      $options: "i",
    }; // Case-insensitive partial match
  }

  if (params?.nazivSeminara) {
    query["seminar.naziv"] = {
      $regex: escapeRegex(params.nazivSeminara),
      $options: "i",
    }; // Case-insensitive partial match
  }
  return query;
}
