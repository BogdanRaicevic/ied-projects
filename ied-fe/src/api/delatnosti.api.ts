import axiosInstanceWithAuth from "./interceptors/auth";

export const fetchAllDelatnosti = async () => {
  const response = await axiosInstanceWithAuth.get(`/api/delatnost`);
  return response.data;
};
