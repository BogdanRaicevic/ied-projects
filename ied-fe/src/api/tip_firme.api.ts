import axios from "axios";
import { env } from "../utils/envVariables";

export const fetchAllTipoviFirme = async (token: string | null) => {
  try {
    const response = await axios.get(`${env.beURL}/api/tip-firme`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching tipovi firme:", error);
    throw error;
  }
};
