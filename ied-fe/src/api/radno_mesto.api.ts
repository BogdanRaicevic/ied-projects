import axiosInstanceWithAuth from "./interceptors/auth";

export const fetchAllRadnaMestaNames = async () => {
  const response = await axiosInstanceWithAuth.get(
    `/api/radna-mesta/all-names`,
  );
  return response.data;
};

export const fetchAllRadnaMesta = async () => {
  const response = await axiosInstanceWithAuth.get(`/api/radna-mesta/all`);
  return response.data;
};
