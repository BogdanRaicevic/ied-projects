import axiosInstanceWithAuth from "./interceptors/auth";

export const fetchAllVelicineFirme = async () => {
  try {
    const response = await axiosInstanceWithAuth.get(`/api/velicine-firmi`);
    return response.data;
  } catch (error) {
    console.error("Error fetching velicine firme:", error);
    throw error;
  }
};
