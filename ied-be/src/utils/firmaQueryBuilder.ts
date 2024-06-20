import { FilterQuery } from "mongoose";
import { FirmaType } from "../models/firma.model";

type FirmaQueryParams = {
  naziv_firme?: string;
  pib?: string;
  email?: string;
  grad?: string[];
  opstina?: string;
  postanski_broj?: string;
  delatnost?: string[];
  tip_firme?: string[];
  radno_mesto?: string[];
  velicina_firme?: string[];
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
    query.email = { $regex: params.email, $options: "i" }; // Case-insensitive partial match
  }
  if (params.opstina) {
    query.opstina = { $regex: params.opstina, $options: "i" }; // Case-insensitive partial match
  }
  if (params.postanski_broj) {
    query.postanski_broj = params.postanski_broj;
  }
  if (params.delatnost && Array.isArray(params.grad)) {
    query.delatnost = { $in: params.delatnost };
  }
  if (params.grad && Array.isArray(params.grad)) {
    query.grad = { $in: params.grad }; // Case-insensitive partial match
  }
  if (params.tip_firme && Array.isArray(params.tip_firme)) {
    query.tip_firme = { $in: params.tip_firme };
  }
  if (params.radno_mesto && Array.isArray(params.radno_mesto)) {
    query.radno_mesto = { $in: params.radno_mesto };
  }
  if (params.velicina_firme && Array.isArray(params.velicina_firme)) {
    query.velicina_firme = { $in: params.velicina_firme };
  }

  return query;
}
