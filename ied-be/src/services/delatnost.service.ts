import { Delatnost } from "../models/delatnosti.model";

export const getAllDelatnosti = async () => {
  try {
    return await Delatnost.find({}).exec();
  } catch (error) {
    console.log("Error finding delatnosti", error);
    throw new Error("Error finding delatnosti");
  }
};
