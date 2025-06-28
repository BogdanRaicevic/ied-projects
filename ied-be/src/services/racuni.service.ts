import {
  type IzdavacRacuna,
  type PretrageRacunaZodType,
  RacunSchema,
  type RacunZod,
  TipRacuna,
} from "@ied-shared/index";
import { isEqual } from "es-toolkit";
import { RacunBaseModel } from "../models/racun.model";
import { createRacunQuery } from "../utils/racuniQueryBuilder";

export const saveRacun = async (racun: RacunZod) => {
  const DiscriminatorModel = RacunBaseModel.discriminators?.[racun.tipRacuna];

  if (!DiscriminatorModel) {
    throw new Error(`Unknown racun type: ${racun.tipRacuna}`);
  }

  try {
    const validatedRacun = validateAndCalculateRacun(racun);

    const newRacun = new DiscriminatorModel(validatedRacun);
    await newRacun.save();
    return newRacun;
  } catch (error) {
    console.error("Error saving Racun:", error);
    throw error;
  }
};

export const getRacunById = async (id: string) => {
  try {
    const racun = await RacunBaseModel.findById(id).lean();
    if (!racun) {
      throw new Error(`Racun with ID ${id} not found.`);
    }
    return racun;
  } catch (error) {
    console.error(`Error getting Racun by ID ${id}:`, error);
    throw error;
  }
};

export const updateRacunById = async (id: string, updatedRacun: RacunZod) => {
  try {
    const DiscriminatorModel =
      RacunBaseModel.discriminators?.[updatedRacun.tipRacuna];

    if (!DiscriminatorModel) {
      throw new Error(`Unknown racun type: ${updatedRacun.tipRacuna}`);
    }

    const racun = await DiscriminatorModel.findByIdAndUpdate(
      id,
      { $set: updatedRacun },
      {
        new: true,
        runValidators: true,
      },
    );
    if (!racun) {
      throw new Error(`Racun with ID ${id} not found for update.`);
    }
    return racun;
  } catch (error) {
    console.error(`Error updating Racun by ID ${id}:`, error);
    throw error;
  }
};

export const searchRacuni = async (
  pageIndex = 0,
  pageSize = 50,
  queryParameters: PretrageRacunaZodType,
) => {
  try {
    const skip = pageIndex * pageSize;
    const mongoQuery = createRacunQuery(queryParameters);

    const [totalDocuments, racuni] = await Promise.all([
      RacunBaseModel.countDocuments(mongoQuery),
      RacunBaseModel.find(mongoQuery)
        .sort({ dateCreatedAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
    ]);

    const totalPages = Math.ceil(totalDocuments / pageSize);

    return {
      racuni,
      totalDocuments,
      totalPages,
    };
  } catch (error) {
    console.error("Error getting all Racuni:", error);
    throw error;
  }
};

export const getRacunByPozivNaBrojAndIzdavac = async (
  pozivNaBroj: string,
  izdavacRacuna: IzdavacRacuna,
  tipRacuna?: TipRacuna,
) => {
  try {
    const racun = await RacunBaseModel.findOne({
      pozivNaBroj: { $eq: pozivNaBroj },
      izdavacRacuna: { $eq: izdavacRacuna },
      ...(tipRacuna && { tipRacuna: { $eq: tipRacuna } }),
    }).lean();

    if (!racun) {
      throw new Error(
        `Racun with PozivNaBroj ${pozivNaBroj}, IzdavacRacuna ${izdavacRacuna} and Tip Racuna ${tipRacuna} not found.`,
      );
    }
    return racun;
  } catch (error) {
    console.error(
      `Error getting Racun by PozivNaBroj ${pozivNaBroj}, IzdavacRacuna ${izdavacRacuna} and Tip Racuna ${tipRacuna}:`,
      error,
    );
    throw error;
  }
};

export const validateAndCalculateRacun = (racun: RacunZod): RacunZod => {
  const calculatedRacun = calculateRacunFields(racun); // same logic on FE

  // Validate that frontend calculations match backend
  if (!isEqual(racun.calculations, calculatedRacun.calculations)) {
    throw new Error("Calculation mismatch detected");
  }

  return calculatedRacun;
};

const calculateRacunFields = (racun: RacunZod) => {
  const racunParsed = RacunSchema.parse(racun);
  const { popustOnline, popustOffline, avansBezPdv, placeno } =
    racunParsed.calculations;
  const { onlineCena, offlineCena, brojUcesnikaOnline, brojUcesnikaOffline } =
    racunParsed.seminar;
  const tipRacuna = racunParsed.tipRacuna;
  const stopaPdv = racunParsed.stopaPdv;

  const onlineUkupnaNaknada =
    onlineCena *
    brojUcesnikaOnline *
    (1 - popustOnline / 100) *
    (1 + stopaPdv / 100);

  const offlineUkupnaNaknada =
    offlineCena *
    brojUcesnikaOffline *
    (1 - popustOffline / 100) *
    (1 + stopaPdv / 100);

  const onlinePoreskaOsnovica =
    onlineCena * brojUcesnikaOnline * (1 - popustOnline / 100);
  const offlinePoreskaOsnovica =
    offlineCena * brojUcesnikaOffline * (1 - popustOffline / 100);
  const avansPdv = (avansBezPdv * stopaPdv) / 100;
  const avans = avansBezPdv + avansPdv;

  const calculations = {
    onlineUkupnaNaknada: roundToTwoDecimals(onlineUkupnaNaknada),
    offlineUkupnaNaknada: roundToTwoDecimals(offlineUkupnaNaknada),
    onlinePoreskaOsnovica: roundToTwoDecimals(onlinePoreskaOsnovica),
    offlinePoreskaOsnovica: roundToTwoDecimals(offlinePoreskaOsnovica),
    popustOnline: popustOnline,
    popustOffline: popustOffline,
    pdvOnline: roundToTwoDecimals((onlinePoreskaOsnovica * stopaPdv) / 100),
    pdvOffline: roundToTwoDecimals((offlinePoreskaOsnovica * stopaPdv) / 100),
    ukupnaNaknada:
      tipRacuna === TipRacuna.KONACNI_RACUN
        ? roundToTwoDecimals(onlineUkupnaNaknada + offlineUkupnaNaknada - avans)
        : roundToTwoDecimals(
            onlineUkupnaNaknada +
              offlineUkupnaNaknada -
              (tipRacuna === TipRacuna.RACUN ? placeno : 0),
          ),
    ukupanPdv:
      tipRacuna === TipRacuna.AVANSNI_RACUN
        ? roundToTwoDecimals(avansPdv)
        : roundToTwoDecimals(
            (offlinePoreskaOsnovica * stopaPdv) / 100 +
              (onlinePoreskaOsnovica * stopaPdv) / 100 -
              (tipRacuna === TipRacuna.KONACNI_RACUN ? avansPdv : 0),
          ),
    avansPdv: roundToTwoDecimals(avansPdv),
    avans: roundToTwoDecimals(avans),
    avansBezPdv: roundToTwoDecimals(avansBezPdv),
    placeno: roundToTwoDecimals(placeno) || 0,
  };

  return {
    ...racunParsed,
    calculations,
  };
};

const roundToTwoDecimals = (num: number): number => {
  return Math.round((num + Number.EPSILON) * 100) / 100;
};
