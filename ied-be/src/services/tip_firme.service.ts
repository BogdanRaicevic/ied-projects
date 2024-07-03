import { TipFirme } from "../models/tip_firme.model";

export const getAllTipoviFirme = async () => {
  try {
    return await TipFirme.find({}).exec();
  } catch (error) {
    console.log("Error finding tip_firme", error);
    throw new Error("Error finding tip_firme");
  }
};
