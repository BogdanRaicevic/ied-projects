import type { IzdavacType } from "ied-shared";
import axiosInstanceWithAuth from "./interceptors/auth";

export const fetchAllIzdavaci = async (): Promise<IzdavacType[]> => {
  const response =
    await axiosInstanceWithAuth.get<IzdavacType[]>("/api/izdavaci");
  return response.data;
};
