import { Mesto } from "../models/mesto.model";

export const getAllMesta = async () => {
  try {
    const result = await Mesto.find({}).exec();
    return result.map((item) => item.naziv_mesto);
  } catch (error) {
    console.log("Error finding delatnosti", error);
    throw new Error("Error finding delatnosti");
  }
};
