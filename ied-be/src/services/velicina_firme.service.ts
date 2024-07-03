import { VelicineFirmi } from "../models/velicine_firmi.model";

export const getAllVelicineFirmi = async () => {
  try {
    return await VelicineFirmi.find({}).exec();
  } catch (error) {
    console.log("Error finding velicine_firmi", error);
    throw new Error("Error finding velicine_firmi");
  }
};
