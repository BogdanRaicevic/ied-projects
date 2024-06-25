import { FilterQuery } from "mongoose";
import { FirmaType } from "../models/firma.model";

type FirmaQueryParams = {
  naziv_firme?: string;
  pib?: string;
  email?: string;
  mesto?: string[];
  postanski_broj?: string;
  delatnost?: string[];
  tip_firme?: string[];
  radno_mesto?: string[];
  velicina?: string[];
};

export function createFirmaQuery(params: FirmaQueryParams): FilterQuery<FirmaType> {
  const query: FilterQuery<FirmaType> = {};

  if (params.naziv_firme) {
    query.naziv_firme = { $regex: params.naziv_firme, $options: "i" }; // Case-insensitive partial match
  }
  if (params.pib) {
    query.PIB = { $regex: params.pib, $options: "i" }; // Case-insensitive partial match
  }
  if (params.email) {
    query.e_mail = { $regex: params.email, $options: "i" }; // Case-insensitive partial match
  }
  if (params.delatnost && Array.isArray(params.mesto)) {
    query.delatnost = { $in: params.delatnost };
  }
  if (params.mesto && Array.isArray(params.mesto)) {
    query.grad = { $in: params.mesto }; // Case-insensitive partial match
  }
  if (params.tip_firme && Array.isArray(params.tip_firme)) {
    query.tip_firme = { $in: params.tip_firme };
  }
  if (params.radno_mesto && Array.isArray(params.radno_mesto)) {
    query.radno_mesto = { $in: params.radno_mesto };
  }
  if (params.velicina && Array.isArray(params.velicina)) {
    query.velicina = { $in: params.velicina };
  }

  return query;
}
