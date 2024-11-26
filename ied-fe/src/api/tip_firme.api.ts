import { env } from "../utils/envVariables";
import axiosInstanceWithAuth from "./interceptors/auth";

export const fetchAllTipoviFirme = async () => {
  try {
    const response = await axiosInstanceWithAuth.get(`${env.beURL}/api/tip-firme`);
    return response.data;
  } catch (error) {
    console.error("Error fetching tipovi firme:", error);
    throw error;
  }
};
