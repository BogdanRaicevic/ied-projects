import {
  MAILING_STATUS,
  type MailingStatus,
  NEGACIJA,
  type ParametriPretrage,
} from "ied-shared";
import { type QueryFilter, Types } from "mongoose";
import type { FirmaType } from "../models/firma.model";
import { Seminar, type SeminarType } from "../models/seminar.model";
import type { Zaposleni } from "../models/zaposleni.model";
import { escapeRegex } from "../utils/utils";

// Statuses to filter by, or undefined when none or all four are selected.
export const mailingStatusFilter = (selected?: MailingStatus[]) =>
  selected?.length &&
  new Set(selected).size < Object.keys(MAILING_STATUS).length
    ? selected
    : undefined;

const NO_EMAIL = [null, ""];
const HAS_EMAIL = { e_mail: { $nin: NO_EMAIL } };

// A status filter only judges contacts that have an email: it never hides a
// firma without its own email, nor one whose zaposleni have none.
// `forExport` also drops firme with no email anywhere (nothing to send to).
export const createFirmaQuery = async (
  params: ParametriPretrage,
  { forExport = false } = {},
) => {
  const query: QueryFilter<FirmaType> = {};

  const negations = params?.negacije || [];
  const negateRadnoMesto = negations.includes(NEGACIJA.radnoMesto);
  const negateTipFirme = negations.includes(NEGACIJA.tipFirme);
  const negateDelatnost = negations.includes(NEGACIJA.delatnost);
  const negateMesto = negations.includes(NEGACIJA.mesto);
  const negateSeminar = negations.includes(NEGACIJA.seminar);
  const negateTipSeminara = negations.includes(NEGACIJA.tipSeminara);

  if (params?.imeFirme && params.imeFirme.length > 0) {
    query.naziv_firme = { $regex: escapeRegex(params.imeFirme), $options: "i" }; // Case-insensitive partial match
  }

  if (params?.pib && params.pib.length > 0) {
    query.PIB = { $regex: escapeRegex(params.pib), $options: "i" }; // Case-insensitive partial match
  }

  if (params?.email && params.email.length > 0) {
    query.e_mail = { $regex: escapeRegex(params.email), $options: "i" }; // Case-insensitive partial match
  }

  if (Array.isArray(params?.delatnosti) && params.delatnosti.length > 0) {
    if (negateDelatnost) {
      query.delatnost = { $nin: params.delatnosti };
    } else {
      query.delatnost = { $in: params.delatnosti };
    }
  }

  if (Array.isArray(params?.mesta) && params.mesta.length > 0) {
    const mestaIds = params.mesta
      .filter((id) => Types.ObjectId.isValid(id))
      .map((id) => new Types.ObjectId(id));
    if (negateMesto) {
      query.mesto = { $nin: mestaIds };
    } else {
      query.mesto = { $in: mestaIds };
    }
  }

  if (Array.isArray(params?.tipoviFirme) && params.tipoviFirme.length > 0) {
    if (negateTipFirme) {
      query.tip_firme = { $nin: params.tipoviFirme };
    } else {
      query.tip_firme = { $in: params.tipoviFirme };
    }
  }

  if (Array.isArray(params?.velicineFirme) && params.velicineFirme.length > 0) {
    query.velicina_firme = { $in: params.velicineFirme };
  }

  if (Array.isArray(params?.stanjaFirme) && params.stanjaFirme.length > 0) {
    query.stanje_firme = { $in: params.stanjaFirme };
  }

  if (params?.jbkjs && params.jbkjs.length > 0) {
    query.jbkjs = { $regex: escapeRegex(params.jbkjs), $options: "i" };
  }

  if (params?.maticniBroj && params.maticniBroj.length > 0) {
    query.maticni_broj = {
      $regex: escapeRegex(params.maticniBroj),
      $options: "i",
    };
  }

  if (params?.komentar && params.komentar.length > 0) {
    query.komentar = {
      $regex: escapeRegex(params.komentar).replace(/\s+/g, "\\s*"),
      $options: "i",
    };
  }

  query.$and = query.$and || [];
  if (Array.isArray(params?.seminari) && params.seminari.length > 0) {
    const seminarIds = params.seminari.map((s) => s);
    const ids = await Seminar.distinct("prijave.firma_id", {
      _id: { $in: seminarIds },
    });

    if (negateSeminar) {
      query.$and.push({ _id: { $nin: ids } });
    } else {
      query.$and.push({ _id: { $in: ids } });
    }
  }

  if (
    Array.isArray(params?.tipoviSeminara) &&
    params.tipoviSeminara.length > 0
  ) {
    const seminarFilter: QueryFilter<SeminarType> = {
      tipSeminara: { $in: params.tipoviSeminara },
    };
    const ids = await Seminar.distinct("prijave.firma_id", seminarFilter);
    if (negateTipSeminara) {
      query.$and.push({ _id: { $nin: ids } });
    } else {
      query.$and.push({ _id: { $in: ids } });
    }
  }

  const firmaStatusi = mailingStatusFilter(params?.firmaMailingStatus);
  if (firmaStatusi) {
    query.$and.push({
      $or: [
        { mailing_status: { $in: firmaStatusi } },
        { e_mail: { $in: NO_EMAIL } },
      ],
    });
  }

  // ____ ZAPOSLENI FILTERS ____
  const zaposleniQuery: QueryFilter<Zaposleni> = {};

  if (Array.isArray(params?.radnaMesta) && params.radnaMesta.length > 0) {
    if (negateRadnoMesto) {
      zaposleniQuery.radno_mesto = { $nin: params.radnaMesta };
    } else {
      zaposleniQuery.radno_mesto = { $in: params.radnaMesta };
    }
  }

  if (params?.imePrezime && params.imePrezime.length > 0) {
    const nameParts = params.imePrezime.split(" ").filter(Boolean);
    const ime = escapeRegex(nameParts[0] || "");
    const prezime = escapeRegex(nameParts[1] || "");

    if (nameParts.length === 1) {
      zaposleniQuery.$or = [
        { ime: { $regex: `^${ime}`, $options: "i" } },
        { prezime: { $regex: `^${ime}`, $options: "i" } },
      ];
    } else {
      zaposleniQuery.$or = [
        {
          ime: { $regex: `^${ime}`, $options: "i" },
          prezime: { $regex: `^${prezime}`, $options: "i" },
        },
        {
          ime: { $regex: `^${prezime}`, $options: "i" },
          prezime: { $regex: `^${ime}`, $options: "i" },
        },
      ];
    }
  }

  if (params?.emailZaposlenog && params.emailZaposlenog.length > 0) {
    zaposleniQuery.e_mail = {
      $regex: escapeRegex(params.emailZaposlenog),
      $options: "i",
    };
  }

  const zaposleniStatusi = mailingStatusFilter(params?.zaposleniMailingStatus);
  const hasZaposleniFilter = Object.keys(zaposleniQuery).length > 0;
  if (zaposleniStatusi) {
    query.$and.push({
      $or: [
        {
          zaposleni: {
            $elemMatch: {
              ...zaposleniQuery,
              mailing_status: { $in: zaposleniStatusi },
              // Only a zaposleni with an email counts. $and, not e_mail:
              // that key may already hold the emailZaposlenog regex.
              $and: [HAS_EMAIL],
            },
          },
        },
        {
          $and: [
            { zaposleni: { $not: { $elemMatch: HAS_EMAIL } } },
            ...(hasZaposleniFilter
              ? [{ zaposleni: { $elemMatch: zaposleniQuery } }]
              : []),
          ],
        },
      ],
    });
  } else if (hasZaposleniFilter) {
    query.$and.push({ zaposleni: { $elemMatch: zaposleniQuery } });
  }

  if (forExport) {
    query.$and.push({
      $or: [HAS_EMAIL, { zaposleni: { $elemMatch: HAS_EMAIL } }],
    });
  }

  if (query.$and.length === 0) {
    delete query.$and;
  }

  return query;
};
