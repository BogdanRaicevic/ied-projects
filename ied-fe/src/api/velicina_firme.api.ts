import axios from "axios";
import { env } from "../utils/envVariables";

export const fetchAllVelicineFirme = async () => {
  try {
    const response = await axios.get(`${env.beURL}/api/velicine-firmi`);
    return response.data;
  } catch (error) {
    console.error("Error fetching velicine firme:", error);
    throw error;
  }
};
