import axios from "axios";
import { env } from "../utils/envVariables";

export const saveSeminar = async (naziv: string, predavac: string, lokacija: string) => {
  try {
    console.log("this is current url", `${env.beURL}/api/seminari/save`);
    const response = await axios.post(`${env.beURL}/api/seminari/save`, {
      naziv,
      predavac,
      lokacija,
    });

    return response.data;
  } catch (error) {
    console.error("Error saving seminar: ", error);
    return { success: false, status: 500, message: "An unexpected error occurred" };
  }
};
