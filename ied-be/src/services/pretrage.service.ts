import { Pretrage } from "./../models/pretrage.mode";

export const getAllPretrage = async () => {
  try {
    const result = await Pretrage.find({}).exec();
    console.log("result", result);
    return result.map((item) => item);
  } catch (error) {
    console.log("Error finding pretrage", error);
    throw new Error("Error finding pretrage");
  }
};
