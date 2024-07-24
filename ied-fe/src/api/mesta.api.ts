import axios from "axios";
import { env } from "../utils/envVariables";

export const fetchAllMesta = async () => {
  try {
    const response = await axios.get(`${env.beURL}/api/mesto/all-names`);
    return response.data;
  } catch (error) {
    console.error("Error fetching mesta:", error);
    throw error;
  }
};
