import { Seminar } from "../schemas/companySchemas";
import { env } from "../utils/envVariables";
import axiosInstanceWithAuth from "./interceptors/auth";
import { SeminarQueryParams } from "ied-shared/types/seminarQueryParams";

export const saveSeminar = async (
  naziv: string,
  predavac: string,
  lokacija: string,
  cena: string,
  datum: string
) => {
  try {
    if (!naziv) {
      console.log("Seminar must contain a name");
      return;
    }
    const response = await axiosInstanceWithAuth.post(`${env.beURL}/api/seminari/save`, {
      naziv,
      predavac,
      lokacija,
      cena,
      datum,
    });

    return response.data;
  } catch (error) {
    console.error("Error saving seminar: ", error);
    return { success: false, status: 500, message: "An unexpected error occurred" };
  }
};

export const fetchSeminari = async (
  pageSize: number,
  pageIndex: number,
  queryParameters: SeminarQueryParams
) => {
  try {
    const body = {
      pageSize: pageSize || 10,
      pageIndex: pageIndex + 1, // becuase MRT is zero based
      queryParameters,
    };

    const response: {
      data: { seminari: Seminar[]; totalPages: number; totalDocuments: number };
    } = await axiosInstanceWithAuth.post(`${env.beURL}/api/seminari/search`, body);
    return response.data;
  } catch (error) {
    console.error("Error fetching firma data:", error);
    throw error;
  }
};
