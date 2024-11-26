import { env } from "../utils/envVariables";
import axiosInstanceWithAuth from "./interceptors/auth";

export const fetchAllMesta = async () => {
  try {
    const response = await axiosInstanceWithAuth.get(`${env.beURL}/api/mesto/all-names`);
    return response.data;
  } catch (error) {
    console.error("Error fetching mesta:", error);
    throw error;
  }
};
