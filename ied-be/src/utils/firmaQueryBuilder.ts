import { FilterQuery } from "mongoose";
import { FirmaType } from "../models/firma.model";
import { FirmaQueryParams } from "ied-shared/types/firmaQueryParams";

enum Negations {
  RadnoMesto = "negate-radno-mesto",
  TipFirme = "negate-tip-firme",
  Delatnost = "negate-delatnost",
  Mesto = "negate-mesto",
}

export function createFirmaQuery(params: FirmaQueryParams): FilterQuery<FirmaType> {
  const query: FilterQuery<FirmaType> = {};

  const negations = params?.negacije || [];
  const negateRadnoMesto = negations.includes(Negations.RadnoMesto);
  const negateTipFirme = negations.includes(Negations.TipFirme);
  const negateDelatnost = negations.includes(Negations.Delatnost);
  const negateMesto = negations.includes(Negations.Mesto);

  // console.log("ovo su params: ", params);
  // add stanja firme to search
  if (params?.imeFirme && params.imeFirme.length > 0) {
    query.naziv_firme = { $regex: params.imeFirme, $options: "i" }; // Case-insensitive partial match
  }

  if (params?.pib && params.pib.length > 0) {
    query.PIB = { $regex: params.pib, $options: "i" }; // Case-insensitive partial match
  }

  if (params?.email && params.email.length > 0) {
    query.e_mail = { $regex: params.email, $options: "i" }; // Case-insensitive partial match
  }

  if (Array.isArray(params?.delatnosti) && params.delatnosti.length > 0) {
    if (negateDelatnost) {
      query.delatnost = { $nin: params.delatnosti };
    } else {
      query.delatnost = { $in: params.delatnosti };
    }
  }

  if (Array.isArray(params?.mesta) && params.mesta.length > 0) {
    if (negateMesto) {
      query.mesto = { $nin: params.mesta };
    } else {
      query.mesto = { $in: params.mesta };
    }
  }

  if (Array.isArray(params?.tipoviFirme) && params.tipoviFirme.length > 0) {
    if (negateTipFirme) {
      query.tip_firme = { $nin: params.tipoviFirme };
    } else {
      query.tip_firme = { $in: params.tipoviFirme };
    }
  }

  if (Array.isArray(params?.radnaMesta) && params.radnaMesta.length > 0) {
    if (negateRadnoMesto) {
      query.zaposleni = { $elemMatch: { radno_mesto: { $nin: params.radnaMesta } } };
    } else {
      query.zaposleni = { $elemMatch: { radno_mesto: { $in: params.radnaMesta } } };
    }
  }

  if (Array.isArray(params?.velicineFirmi) && params.velicineFirmi.length > 0) {
    query.velicina = { $in: params.velicineFirmi };
  }

  if (Array.isArray(params?.stanjaFirme) && params.stanjaFirme.length > 0) {
    query.stanje_firme = { $in: params.stanjaFirme };
  }

  if (params?.jbkjs && params.jbkjs.length > 0) {
    query.jbkjs = { $regex: params.jbkjs, $options: "i" }; // Case-insensitive partial match
  }

  if (params?.maticniBroj && params.maticniBroj.length > 0) {
    query.maticni_broj = { $regex: params.maticniBroj, $options: "i" }; // Case-insensitive partial match
  }

  if (params?.komentar && params.komentar.length > 0) {
    query.komentar = { $regex: params.komentar.replace(/\s+/g, "\\s*"), $options: "is" };
  }

  console.log("query", query);

  return query;
}
