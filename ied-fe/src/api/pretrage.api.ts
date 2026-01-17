import type { ParametriPretrage } from "ied-shared";
import axiosInstanceWithAuth from "./interceptors/auth";

export const savePretraga = async (
  queryParameters: ParametriPretrage,
  pretraga: { id?: string; naziv: string },
) => {
  try {
    const body = {
      queryParameters,
      pretraga,
    };

    const response = await axiosInstanceWithAuth.post(
      `/api/pretrage/save`,
      body,
    );
    return response.data;
  } catch (error) {
    console.error("Error saving pretraga:", error);
    throw error;
  }
};

export const fetchAllPretrage = async () => {
  try {
    const r = await axiosInstanceWithAuth.get(`/api/pretrage`);
    return r.data;
  } catch (error) {
    console.error("Error fetching pretrage", error);
    throw error;
  }
};

export const deletePretraga = async ({ id }: { id: string }) => {
  try {
    const body = {
      id,
    };

    const response = await axiosInstanceWithAuth.post(
      `/api/pretrage/delete`,
      body,
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting pretraga:", error);
    throw error;
  }
};
