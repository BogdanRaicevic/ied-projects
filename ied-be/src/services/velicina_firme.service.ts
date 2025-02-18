import { VelicineFirmi } from "../models/velicina_firme.model";

export const getAllVelicineFirmi = async () => {
  try {
    const result = await VelicineFirmi.find({}, { velicina_firme: 1, _id: 0 })
      .sort({ velicina_firme: 1 })
      .exec();
    return result.map((item) => item.velicina_firme);
  } catch (error) {
    console.log("Error finding velicine_firmi", error);
    throw new Error("Error finding velicine_firmi");
  }
};
