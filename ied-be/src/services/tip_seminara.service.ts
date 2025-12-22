import { TipSeminara } from "../models/tip_seminara.model";

export const getAllTipSeminara = async () => {
  try {
    const result = await TipSeminara.find({}).sort({ tipSeminara: 1 }).exec();
    return result.map((item) => item.tipSeminara);
  } catch (error) {
    console.log("Error finding tipSeminara", error);
    throw new Error("Error finding tipSeminara");
  }
};
