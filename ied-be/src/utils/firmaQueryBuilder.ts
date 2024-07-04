import { FilterQuery } from "mongoose";
import { FirmaType } from "../models/firma.model";

type FirmaQueryParams = {
  naziv_firme?: string;
  pib?: string;
  email?: string;
  mesto?: string[];
  delatnost?: string[];
  tip_firme?: string[];
  radnaMesta?: string[];
  velicineFirmi?: string[];
};

export function createFirmaQuery(params: FirmaQueryParams): FilterQuery<FirmaType> {
  const query: FilterQuery<FirmaType> = {};

  console.log("ovo su params: ", params);
  if (params.naziv_firme) {
    query.naziv_firme = { $regex: params.naziv_firme, $options: "i" }; // Case-insensitive partial match
  }
  if (params.pib) {
    query.PIB = { $regex: params.pib, $options: "i" }; // Case-insensitive partial match
  }
  if (params.email) {
    query.e_mail = { $regex: params.email, $options: "i" }; // Case-insensitive partial match
  }
  if (params.delatnost) {
    query.delatnost = { $regex: params.delatnost, $options: "i" };
  }
  if (params.mesto) {
    query.mesto = { $in: params.mesto }; // Case-insensitive partial match
  }
  if (params.tip_firme) {
    query.tip_firme = { $in: params.tip_firme };
  }

  // NOTE: This affects both firma and zaposleni search
  // consult with Branka
  if (Array.isArray(params.radnaMesta) && params.radnaMesta.length > 0) {
    query.zaposleni = { $elemMatch: { radno_mesto: { $in: params.radnaMesta } } };
  }

  if (Array.isArray(params.velicineFirmi) && params.velicineFirmi.length > 0) {
    query.velicina = { $in: params.velicineFirmi };
  }

  return query;
}
