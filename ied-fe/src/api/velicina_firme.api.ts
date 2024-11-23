import axios from "axios";
import { env } from "../utils/envVariables";

export const fetchAllVelicineFirme = async (token: string | null) => {
  try {
    const response = await axios.get(`${env.beURL}/api/velicine-firmi`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching velicine firme:", error);
    throw error;
  }
};
