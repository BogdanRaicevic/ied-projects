import axiosInstanceWithAuth from "./interceptors/auth";
import { env } from "../utils/envVariables";

export const fetchAllDelatnosti = async () => {
  try {
    const response = await axiosInstanceWithAuth.get(`${env.beURL}/api/delatnost`);
    return response.data;
  } catch (error) {
    console.error("Error fetching delatnosti:", error);
    throw error;
  }
};
