import { TipFirme } from "../models/tip_firme.model";

export const getAllTipoviFirme = async () => {
  try {
    const result = await TipFirme.find({}).exec();
    return result.map((item) => item.tip_firme);
  } catch (error) {
    console.log("Error finding tip_firme", error);
    throw new Error("Error finding tip_firme");
  }
};
