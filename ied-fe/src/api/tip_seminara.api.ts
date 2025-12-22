import axiosInstanceWithAuth from "./interceptors/auth";

export const fetchAllTipoviSeminara = async () => {
  try {
    const response = await axiosInstanceWithAuth.get(`/api/tip-seminara/all`);
    return response.data;
  } catch (error) {
    console.error("Error fetching tipovi seminara:", error);
    throw error;
  }
};
