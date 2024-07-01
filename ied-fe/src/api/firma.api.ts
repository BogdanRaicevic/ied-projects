import axios from "axios";
import { Company } from "../schemas/companySchemas";

// TODO: move to env file
const API_URL = "http://localhost:8000"; // Replace with your backend URL

export const fetchFirmaPretrageData = async (pageSize: number, pageIndex: number) => {
  try {
    const body = {
      pageSize: pageSize || 10,
      pageIndex: pageIndex + 1, // becuase MRT is zero based
    };

    const response: {
      data: { firmas: any[]; totalPages: number; totalDocuments: number };
    } = await axios.post(`${API_URL}/api/firma/search`, body);
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
