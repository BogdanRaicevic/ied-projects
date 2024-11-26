import { env } from "../utils/envVariables";
import axiosInstanceWithAuth from "./interceptors/auth";

export const fetchAllVelicineFirme = async () => {
  try {
    const response = await axiosInstanceWithAuth.get(`${env.beURL}/api/velicine-firmi`);
    return response.data;
  } catch (error) {
    console.error("Error fetching velicine firme:", error);
    throw error;
  }
};
