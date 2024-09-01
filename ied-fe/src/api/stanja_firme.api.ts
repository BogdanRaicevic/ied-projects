import axios from "axios";
import { env } from "../utils/envVariables";

export const fetchAllStanjaFirme = async () => {
  try {
    const response = await axios.get(`${env.beURL}/api/stanja-firmi`);
    return response.data;
  } catch (error) {
    console.error("Error fetching stamja firme:", error);
    throw error;
  }
};
