import { Delatnost } from "../models/delatnosti.model";

export const getAllDelatnosti = async () => {
  try {
    const result = await Delatnost.find({}).sort({ delatnost: 1 }).exec();
    return result.map((item) => item.delatnost);
  } catch (error) {
    console.error("Error finding delatnosti", error);
    throw error;
  }
};
