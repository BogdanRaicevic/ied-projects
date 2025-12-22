import { RadnaMesta } from "../models/radna_mesta.model";

export const getAllRadnaMesta = async () => {
  try {
    const result = await RadnaMesta.find({}).sort({ radno_mesto: 1 }).exec();
    return result.map((item) => item.radno_mesto);
  } catch (error) {
    console.error("Error finding radna_mesta", error);
    throw error;
  }
};
