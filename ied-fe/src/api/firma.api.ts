import axios from "axios";

const API_URL = "http://localhost:8000"; // Replace with your backend URL

export const fetchFirmaData = async () => {
  try {
    const response = await axios.post(`${API_URL}/api/firma/search`);
    return response.data;
  } catch (error) {
    console.error("Error fetching firma data:", error);
    throw error;
  }
};
