import type { TipSeminara, TipSeminaraFromDB } from "ied-shared";
import axiosInstanceWithAuth from "./interceptors/auth";

export const fetchAllTipoviSeminara = async (): Promise<
  TipSeminaraFromDB[]
> => {
  const response = await axiosInstanceWithAuth.get(
    `/api/tip-seminara/all-tip-seminara`,
  );
  return response.data;
};

export const createTipSeminara = async (
  data: TipSeminara,
): Promise<TipSeminaraFromDB> => {
  const response = await axiosInstanceWithAuth.post(
    `/api/tip-seminara/create`,
    data,
  );
  return response.data;
};

export const updateTipSeminara = async (
  id: string,
  data: TipSeminara,
): Promise<TipSeminaraFromDB> => {
  const response = await axiosInstanceWithAuth.put(
    `/api/tip-seminara/update/${id}`,
    data,
  );
  return response.data;
};

export const deleteTipSeminara = async (id: string) => {
  const response = await axiosInstanceWithAuth.delete(
    `/api/tip-seminara/delete/${id}`,
  );
  return response.data;
};
