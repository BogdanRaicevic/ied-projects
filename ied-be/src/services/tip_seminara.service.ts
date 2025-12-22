import { TipSeminara } from "../models/tip_seminara.model";

export const getAllTipSeminara = async (): Promise<string[]> => {
  try {
    const result = await TipSeminara.find({}).sort({ tipSeminara: 1 }).exec();
    return result.map((item) => item.tipSeminara);
  } catch (error) {
    console.error("Error finding tipSeminara", error);
    throw error;
  }
};
