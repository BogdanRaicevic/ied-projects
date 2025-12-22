import { Mesto } from "../models/mesto.model";

export const getAllMesta = async () => {
  try {
    const result = await Mesto.find({}).sort({ naziv_mesto: 1 }).exec();
    return result.map((item) => item.naziv_mesto);
  } catch (error) {
    console.log("Error finding mesta", error);
    throw new Error("Error finding mesta");
  }
};
