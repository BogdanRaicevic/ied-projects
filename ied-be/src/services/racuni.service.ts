import { IzdavacRacuna, PretrageRacunaZodType, RacunZod, TipRacuna } from "@ied-shared/index";
import { RacunModel } from "../models/racun.model";
import { createRacunQuery } from "../utils/racuniQueryBuilder";

export const saveRacun = async (racun: RacunZod) => {
  try {
    const newRacun = new RacunModel(racun);
    await newRacun.save();
    return newRacun;
  } catch (error) {
    console.error("Error saving Racun:", error);
    throw error;
  }
};

export const getRacunById = async (id: string) => {
  try {
    const racun = await RacunModel.findById(id);
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
    const racun = await RacunModel.findByIdAndUpdate(id, updatedRacun, {
      new: true,
      runValidators: true,
    });
    if (!racun) {
      throw new Error(`Racun with ID ${id} not found for update.`);
    }
    return racun;
  } catch (error) {
    console.error(`Error updating Racun by ID ${id}:`, error);
    throw error;
  }
};

export const deleteRacunById = async (id: string) => {
  try {
    const racun = await RacunModel.findByIdAndDelete(id);
    return racun;
  } catch (error) {
    console.error(`Error deleting Racun by ID ${id}:`, error);
    throw error;
  }
};

export const searchRacuni = async (
  pageIndex = 0,
  pageSize = 50,
  queryParameters: PretrageRacunaZodType
) => {
  try {
    const skip = pageIndex * pageSize;
    const mongoQuery = createRacunQuery(queryParameters);

    const [totalDocuments, racuni] = await Promise.all([
      RacunModel.countDocuments(mongoQuery),
      RacunModel.find(mongoQuery).sort({ pozivNaBroj: -1 }).skip(skip).limit(pageSize),
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
  tipRacuna?: TipRacuna
) => {
  try {
    const racun = await RacunModel.findOne({ pozivNaBroj, izdavacRacuna, tipRacuna });
    if (!racun) {
      throw new Error(
        `Racun with PozivNaBroj ${pozivNaBroj}, IzdavacRacuna ${izdavacRacuna} and Tip Racuna ${tipRacuna} not found.`
      );
    }
    return racun;
  } catch (error) {
    console.error(
      `Error getting Racun by PozivNaBroj ${pozivNaBroj}, IzdavacRacuna ${izdavacRacuna} and Tip Racuna ${tipRacuna}:`,
      error
    );
    throw error;
  }
};
