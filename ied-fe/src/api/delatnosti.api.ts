import axios from "axios";
import { env } from "../utils/envVariables";

export const fetchAllDelatnosti = async (token: string | null) => {
  try {
    const response = await axios.get(`${env.beURL}/api/delatnost`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching delatnosti:", error);
    throw error;
  }
};
