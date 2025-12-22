import { TipFirme } from "../models/tip_firme.model";

export const getAllTipoviFirme = async () => {
  try {
    const result = await TipFirme.find({}).sort({ tip_firme: 1 }).exec();
    return result.map((item) => item.tip_firme);
  } catch (error) {
    console.error("Error finding tip_firme", error);
    throw error;
  }
};
