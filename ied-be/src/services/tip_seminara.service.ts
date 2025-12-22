import { TipSeminara } from "../models/tip_seminara.model";

export const getAllTipSeminara = async (): Promise<
  { _id: string; tipSeminara: string }[]
> => {
  try {
    const result = await TipSeminara.find({}).sort({ tipSeminara: 1 }).lean();
    return result.map((item) => ({
      _id: item._id.toString(),
      tipSeminara: item.tipSeminara,
    }));
  } catch (error) {
    console.error("Error finding tipSeminara", error);
    throw error;
  }
};
