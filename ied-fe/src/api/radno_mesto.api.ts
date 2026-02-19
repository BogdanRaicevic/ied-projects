import axiosInstanceWithAuth from "./interceptors/auth";

export const fetchAllRadnaMestaNames = async () => {
  try {
    const response = await axiosInstanceWithAuth.get(
      `/api/radna-mesta/all-names`,
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching radna mesta:", error);
    throw error;
  }
};

export const fetchAllRadnaMesta = async () => {
  try {
    const response = await axiosInstanceWithAuth.get(`/api/radna-mesta/all`);
    return response.data;
  } catch (error) {
    console.error("Error fetching radna mesta:", error);
    throw error;
  }
};
