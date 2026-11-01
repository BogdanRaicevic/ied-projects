import axiosInstanceWithAuth from "./interceptors/auth";

export const fetchAllMesta = async () => {
  const response = await axiosInstanceWithAuth.get(`/api/mesto/all`);
  return response.data;
};

export const fetchAllMestaNames = async () => {
  const response = await axiosInstanceWithAuth.get(`/api/mesto/all-names`);
  return response.data;
};
