import axiosInstanceWithAuth from "./interceptors/auth";

export const fetchAllStanjaFirme = async () => {
  const response = await axiosInstanceWithAuth.get(`/api/stanja-firmi`);
  return response.data;
};
