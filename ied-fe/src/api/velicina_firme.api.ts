import axiosInstanceWithAuth from "./interceptors/auth";

export const fetchAllVelicineFirme = async () => {
  const response = await axiosInstanceWithAuth.get(`/api/velicine-firmi`);
  return response.data;
};
