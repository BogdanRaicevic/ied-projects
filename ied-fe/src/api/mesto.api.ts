import axiosInstanceWithAuth from "./interceptors/auth";

export const fetchAllMestaNames = async () => {
  try {
    const response = await axiosInstanceWithAuth.get(`/api/mesto/all-names`);
    return response.data;
  } catch (error) {
    console.error("Error fetching mesta names:", error);
    throw error;
  }
};

export const fetchAllMesta = async () => {
  try {
    const response = await axiosInstanceWithAuth.get(`/api/mesto/all`);
    return response.data;
  } catch (error) {
    console.error("Error fetching mesta:", error);
    throw error;
  }
};
