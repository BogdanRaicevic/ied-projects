import { env } from "../utils/envVariables";
import axiosInstanceWithAuth from "./interceptors/auth";

export const fetchAllRadnaMesta = async () => {
  try {
    const response = await axiosInstanceWithAuth.get(`${env.beURL}/api/radna-mesta`);
    return response.data;
  } catch (error) {
    console.error("Error fetching radna mesta:", error);
    throw error;
  }
};
