import type { ParametriPretrage } from "ied-shared";
import axiosInstanceWithAuth from "./interceptors/auth";

export const savePretraga = async (
  queryParameters: ParametriPretrage,
  pretraga: { id?: string; naziv: string },
) => {
  const body = {
    queryParameters,
    pretraga,
  };

  const response = await axiosInstanceWithAuth.post(`/api/pretrage/save`, body);
  return response.data;
};

export const fetchAllPretrage = async () => {
  const r = await axiosInstanceWithAuth.get(`/api/pretrage`);
  return r.data;
};

export const deletePretraga = async ({ id }: { id: string }) => {
  const body = {
    id,
  };

  const response = await axiosInstanceWithAuth.post(
    `/api/pretrage/delete`,
    body,
  );
  return response.data;
};
