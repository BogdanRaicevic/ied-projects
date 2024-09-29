import { FilterQuery } from "mongoose";
import { FirmaType } from "../models/firma.model";

enum Negations {
  RadnoMesto = "negate-radno-mesto",
  TipFirme = "negate-tip-firme",
  Delatnost = "negate-delatnost",
  Mesto = "negate-mesto",
}

export type FirmaQueryParams = {
  imeFirme?: string;
  pib?: string;
  email?: string;
  mesta?: string[];
  delatnosti?: string[];
  tipoviFirme?: string[];
  radnaMesta?: string[];
  velicineFirmi?: string[];
  negacije?: string[];
  stanjaFirme?: string[];
};

export function createFirmaQuery(params: FirmaQueryParams): FilterQuery<FirmaType> {
  const query: FilterQuery<FirmaType> = {};

  const negations = params.negacije || [];
  const negateRadnoMesto = negations.includes(Negations.RadnoMesto);
  const negateTipFirme = negations.includes(Negations.TipFirme);
  const negateDelatnost = negations.includes(Negations.Delatnost);
  const negateMesto = negations.includes(Negations.Mesto);

  // console.log("ovo su params: ", params);
  // add stanja firme to search
  if (params.imeFirme && params.imeFirme.length > 0) {
    query.naziv_firme = { $regex: params.imeFirme, $options: "i" }; // Case-insensitive partial match
  }

  if (params.pib && params.pib.length > 0) {
    query.PIB = { $regex: params.pib, $options: "i" }; // Case-insensitive partial match
  }

  if (params.email && params.email.length > 0) {
    query.e_mail = { $regex: params.email, $options: "i" }; // Case-insensitive partial match
  }

  if (Array.isArray(params.delatnosti) && params.delatnosti.length > 0) {
    if (negateDelatnost) {
      query.delatnost = { $nin: params.delatnosti };
    } else {
      query.delatnost = { $in: params.delatnosti };
    }
  }

  if (Array.isArray(params.mesta) && params.mesta.length > 0) {
    if (negateMesto) {
      query.mesto = { $nin: params.mesta };
    } else {
      query.mesto = { $in: params.mesta };
    }
  }

  if (Array.isArray(params.tipoviFirme) && params.tipoviFirme.length > 0) {
    if (negateTipFirme) {
      query.tip_firme = { $nin: params.tipoviFirme };
    } else {
      query.tip_firme = { $in: params.tipoviFirme };
    }
  }

  if (Array.isArray(params.radnaMesta) && params.radnaMesta.length > 0) {
    if (negateRadnoMesto) {
      query.zaposleni = { $elemMatch: { radno_mesto: { $nin: params.radnaMesta } } };
    } else {
      query.zaposleni = { $elemMatch: { radno_mesto: { $in: params.radnaMesta } } };
    }
  }

  if (Array.isArray(params.velicineFirmi) && params.velicineFirmi.length > 0) {
    query.velicina = { $in: params.velicineFirmi };
  }

  if (Array.isArray(params.stanjaFirme) && params.stanjaFirme.length > 0) {
    query.stanje_firme = { $in: params.stanjaFirme };
  }

  console.log("query", query);

  return query;
}
