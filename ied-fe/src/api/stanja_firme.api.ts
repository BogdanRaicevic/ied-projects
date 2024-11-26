import { env } from "../utils/envVariables";
import axiosInstanceWithAuth from "./interceptors/auth";

export const fetchAllStanjaFirme = async () => {
  try {
    const response = await axiosInstanceWithAuth.get(`${env.beURL}/api/stanja-firmi`);
    return response.data;
  } catch (error) {
    console.error("Error fetching stamja firme:", error);
    throw error;
  }
};
