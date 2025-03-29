import { TipFirme } from "../models/tip_firme.model.js";

export const getAllTipoviFirme = async () => {
  try {
    const result = await TipFirme.find({}).sort({ tip_firme: 1 }).exec();
    return result.map((item) => item.tip_firme);
  } catch (error) {
    console.log("Error finding tip_firme", error);
    throw new Error("Error finding tip_firme");
  }
};
