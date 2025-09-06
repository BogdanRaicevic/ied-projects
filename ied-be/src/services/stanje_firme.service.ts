import { StanjeFirme } from "../models/stanje_firme.model";

export const getAllStanjaFirmi = async () => {
  try {
    const result = await StanjeFirme.find({}, { _id: 0 }).exec();
    return result.map((item) => item.stanje_firme);
  } catch (error) {
    console.error("Error finding stanje_firme", error);
    throw new Error("Error finding stanje_firme");
  }
};
