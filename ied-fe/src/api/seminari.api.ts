import axios from "axios";
import { env } from "../utils/envVariables";

export const saveSeminar = async (name: string, lecturer: string, location: string) => {
  try {
    const response = await axios.post(`${env.beURL}/api/seminari/save`, {
      name,
      lecturer,
      location,
    });

    return response.data;
  } catch (error) {
    console.error("Error saving seminar: ", error);
    return { success: false, status: 500, message: "An unexpected error occurred" };
  }
};
