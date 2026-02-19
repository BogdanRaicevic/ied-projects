import { RadnoMesto } from "../models/radno_mesto.model";

export const getAllRadnaMestaNames = async () => {
  try {
    const result = await RadnoMesto.find({}).sort({ radno_mesto: 1 }).exec();
    return result.map((item) => item.radno_mesto);
  } catch (error) {
    console.error("Error finding radna_mesta", error);
    throw error;
  }
};

export const getAllRadnaMesta = async () => {
  try {
    const result = await RadnoMesto.find({}).sort({ radno_mesto: 1 }).exec();
    return result;
  } catch (error) {
    console.error("Error finding radna_mesta", error);
    throw error;
  }
};
