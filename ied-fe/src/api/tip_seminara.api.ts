import type { TipSeminara, TipSeminaraFromDB } from "ied-shared";
import axiosInstanceWithAuth from "./interceptors/auth";

export const fetchAllTipoviSeminara = async (): Promise<
  TipSeminaraFromDB[]
> => {
  try {
    const response = await axiosInstanceWithAuth.get(
      `/api/tip-seminara/all-tip-seminara`,
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching tipovi seminara:", error);
    throw error;
  }
};

export const createTipSeminara = async (
  data: TipSeminara,
): Promise<TipSeminaraFromDB> => {
  try {
    const response = await axiosInstanceWithAuth.post(
      `/api/tip-seminara/create`,
      data,
    );
    return response.data;
  } catch (error) {
    console.error("Error creating tip seminara:", error);
    throw error;
  }
};

export const updateTipSeminara = async (
  id: string,
  data: TipSeminara,
): Promise<TipSeminaraFromDB> => {
  try {
    const response = await axiosInstanceWithAuth.put(
      `/api/tip-seminara/update/${id}`,
      data,
    );
    return response.data;
  } catch (error) {
    console.error("Error updating tip seminara:", error);
    throw error;
  }
};

export const deleteTipSeminara = async (id: string) => {
  try {
    const response = await axiosInstanceWithAuth.delete(
      `/api/tip-seminara/delete/${id}`,
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting tip seminara:", error);
    throw error;
  }
};
