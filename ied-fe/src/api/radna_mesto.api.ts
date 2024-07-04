import axios from "axios";
import { env } from "../utils/envVariables";

export const fetchAllRadnaMesta = async () => {
  try {
    const response = await axios.get(`${env.beURL}/api/radna-mesta`);
    return response.data;
  } catch (error) {
    console.error("Error fetching radna mesta:", error);
    throw error;
  }
};
