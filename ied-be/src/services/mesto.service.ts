import type { MestoFromDBType } from "ied-shared";
import { Mesto } from "../models/mesto.model";

export const getMestaNames = async (): Promise<string[]> => {
  try {
    const result = await Mesto.find({}).sort({ naziv_mesto: 1 }).lean();
    return result.map((item) => item.naziv_mesto);
  } catch (error) {
    console.error("Error finding mesta", error);
    throw error;
  }
};

export const getMesta = async (): Promise<MestoFromDBType[]> => {
  try {
    const result = await Mesto.find({}).sort({ naziv_mesto: 1 }).lean();
    return result.map((item) => ({
      _id: item._id.toString(),
      naziv_mesto: item.naziv_mesto,
      postanski_broj: item.postanski_broj,
    }));
  } catch (error) {
    console.error("Error finding mesta", error);
    throw error;
  }
};
