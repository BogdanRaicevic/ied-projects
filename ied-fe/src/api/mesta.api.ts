import axios from "axios";
import { env } from "../utils/envVariables";

export const fetchAllMesta = async (token: string | null) => {
  try {
    const response = await axios.get(`${env.beURL}/api/mesto/all-names`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching mesta:", error);
    throw error;
  }
};
