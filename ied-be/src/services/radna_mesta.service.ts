import { RadnaMesta } from "../models/radna_mesta.model";

export const getAllRadnaMesta = async () => {
  try {
    return await RadnaMesta.find({}).exec();
  } catch (error) {
    console.log("Error finding radna_mesta", error);
    throw new Error("Error finding radna_mesta");
  }
};
