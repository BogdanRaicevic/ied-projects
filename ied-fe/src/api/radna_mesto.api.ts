import axios from "axios";
import { env } from "../utils/envVariables";

export const fetchAllRadnaMesta = async (token: string | null) => {
  try {
    const response = await axios.get(`${env.beURL}/api/radna-mesta`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching radna mesta:", error);
    throw error;
  }
};
