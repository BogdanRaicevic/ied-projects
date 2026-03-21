import type {
  TipSeminaraFromDB,
  TipSeminara as TipSeminaraType,
} from "ied-shared";
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

export const createTipSeminara = async (
  data: TipSeminaraType,
): Promise<TipSeminaraFromDB> => {
  try {
    const result = await TipSeminara.create(data);
    return {
      _id: result._id.toString(),
      tipSeminara: result.tipSeminara,
    };
  } catch (error) {
    console.error("Error creating tipSeminara", error);
    throw error;
  }
};

export const updateTipSeminara = async (
  id: string,
  data: TipSeminaraType,
): Promise<TipSeminaraFromDB> => {
  try {
    const result = await TipSeminara.findByIdAndUpdate(id, data, {
      returnDocument: "after",
      runValidators: true,
    }).lean();

    if (!result) {
      throw new Error("Tip seminara not found");
    }
    return {
      _id: result._id.toString(),
      tipSeminara: result.tipSeminara,
    };
  } catch (error) {
    console.error("Error updating tipSeminara", error);
    throw error;
  }
};

export const deleteTipSeminara = async (id: string) => {
  try {
    await TipSeminara.findByIdAndDelete(id);
  } catch (error) {
    console.error("Error deleting tipSeminara", error);
    throw error;
  }
};
