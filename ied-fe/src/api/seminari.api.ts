import axios from "axios";
import { env } from "../utils/envVariables";

export const saveSeminar = async (name: string, lecturer: string, location: string) => {
  console.log("API URL:", `${env.beURL}/api/seminari/save`);

  try {
    const response = await axios.post(`${env.beURL}/api/seminari/save`, {
      name,
      lecturer,
      location,
    });
    console.log("hello 3");
    return console.log("Input:", response.data);
  } catch (error) {
    console.error("Error saving seminar: ", error);
    if (axios.isAxiosError(error) && error.response) {
      return { success: false, status: 500, message: error.response.data.message };
    }
    return { success: false, status: 500, message: "An unexpected error occurred" };
  }
};
