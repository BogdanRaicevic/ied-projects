import axios from "axios";
import { env } from "../utils/envVariables";

export const fetchAllTipoviFirme = async () => {
  try {
    const response = await axios.get(`${env.beURL}/api/tip-firme`);
    return response.data;
  } catch (error) {
    console.error("Error fetching tipovi firme:", error);
    throw error;
  }
};
