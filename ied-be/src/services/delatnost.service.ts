import { Delatnost } from "../models/delatnosti.model";

export const getAllDelatnosti = async () => {
  try {
    const result = await Delatnost.find({}).sort({ delatnost: 1 }).exec();
    return result.map((item) => item.delatnost);
  } catch (error) {
    console.log("Error finding delatnosti", error);
    throw new Error("Error finding delatnosti");
  }
};
