import axios from "axios";
import { Company } from "../schemas/companySchemas";

// TODO: move to env file
const API_URL = "http://localhost:8000"; // Replace with your backend URL

export const fetchFirmaPretrageData = async () => {
  try {
    const response = await axios.post(`${API_URL}/api/firma/search`);
    return response.data;
  } catch (error) {
    console.error("Error fetching firma data:", error);
    throw error;
  }
};

export const fetchSingleFirmaData = async (ID_firma: number): Promise<Company | null> => {
  try {
    const response = await axios.get(`${API_URL}/api/firma/${ID_firma}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching firma data:", error);
    throw error;
  }
};
