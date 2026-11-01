import axiosInstanceWithAuth from "./interceptors/auth";

export const fetchAllTipoviFirme = async () => {
  const response = await axiosInstanceWithAuth.get(`/api/tip-firme`);
  return response.data;
};
