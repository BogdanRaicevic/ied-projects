import { FilterQuery } from "mongoose";
import { FirmaType } from "../models/firma.model";

type FirmaQueryParams = {
  naziv_firme?: string;
  pib?: string;
  email?: string;
  mesto?: string[];
  delatnosti?: string[];
  tipoviFirme?: string[];
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
  if (Array.isArray(params.delatnosti) && params.delatnosti.length > 0) {
    query.delatnost = { $in: params.delatnosti };
  }
  if (params.mesto) {
    query.mesto = { $in: params.mesto }; // Case-insensitive partial match
  }
  if (Array.isArray(params.tipoviFirme) && params.tipoviFirme.length > 0) {
    query.tip_firme = { $in: params.tipoviFirme };
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
