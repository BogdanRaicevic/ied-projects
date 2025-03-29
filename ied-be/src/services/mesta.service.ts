import { Mesto } from "../models/mesto.model.js";

export const getAllMesta = async () => {
  try {
    const result = await Mesto.find({}).sort({ naziv_mesto: 1 }).exec();
    return result.map((item) => item.naziv_mesto);
  } catch (error) {
    console.log("Error finding delatnosti", error);
    throw new Error("Error finding delatnosti");
  }
};
