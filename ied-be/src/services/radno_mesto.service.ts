import type { RadnoMestoFromDBType } from "ied-shared";
import { RadnoMesto } from "../models/radno_mesto.model";

export const getAllRadnaMestaNames = async (): Promise<string[]> => {
  try {
    const result = await RadnoMesto.find({}).sort({ radno_mesto: 1 }).lean();
    return result.map((item) => item.radno_mesto);
  } catch (error) {
    console.error("Error finding radna_mesta", error);
    throw error;
  }
};

export const getAllRadnaMesta = async (): Promise<RadnoMestoFromDBType[]> => {
  try {
    const result = await RadnoMesto.find({}).sort({ radno_mesto: 1 }).lean();
    return result.map((item) => ({
      _id: item._id.toString(),
      radno_mesto: item.radno_mesto,
    }));
  } catch (error) {
    console.error("Error finding radna_mesta", error);
    throw error;
  }
};
