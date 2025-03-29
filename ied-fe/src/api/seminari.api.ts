import type { PrijavaNaSeminar, SeminarType } from "../schemas/firmaSchemas";
import { env } from "../utils/envVariables";
import axiosInstanceWithAuth from "./interceptors/auth";
import type { SeminarQueryParams } from "@ied-shared/types/seminar";

export const saveSeminar = async (
  naziv: string,
  predavac: string,
  lokacija: string,
  onlineCena: string,
  offlineCena: string,
  datum: string,
  _id?: string
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
      onlineCena,
      offlineCena,
      datum,
      _id,
    });

    return response.data;
  } catch (error) {
    console.error("Error saving seminar: ", error);
    throw error;
  }
};

export const fetchSeminari = async (
  pageSize: number,
  pageIndex: number,
  queryParameters: SeminarQueryParams
) => {
  try {
    const body = {
      pageSize: pageSize || 50,
      pageIndex: pageIndex + 1, // becuase MRT is zero based
      queryParameters,
    };

    const response: {
      data: {
        seminari: SeminarType[];
        totalPages: number;
        totalDocuments: number;
      };
    } = await axiosInstanceWithAuth.post(`${env.beURL}/api/seminari/search`, body);

    return response.data;
  } catch (error) {
    console.error("Error fetching firma data:", error);
    throw error;
  }
};

export const fetchSeminarById = async (id: string) => {
  try {
    const response = await axiosInstanceWithAuth.get(`${env.beURL}/api/seminari/${id}`);

    return response.data;
  } catch (error) {
    console.error("Error fetching seminar data:", error);
    throw error;
  }
};

export const savePrijava = async (prijava: PrijavaNaSeminar) => {
  try {
    const response = await axiosInstanceWithAuth.post(
      `${env.beURL}/api/seminari/save-prijava`,
      prijava
    );

    return response.data;
  } catch (error: any) {
    if (error.response.status === 409) {
      throw new Error("Zaposleni je već prijavljen na seminar", {
        cause: "duplicate",
      });
    }
    throw error;
  }
};

export const deletePrijava = async (zaposleni_id: string, seminar_id: string) => {
  try {
    const response = await axiosInstanceWithAuth.delete(
      `${env.beURL}/api/seminari/delete-prijava/?zaposleni_id=${zaposleni_id}&seminar_id=${seminar_id}`
    );

    return response.data;
  } catch (error) {
    console.error("Error deleting prijava: ", error);
    throw error;
  }
};

export const deleteSeminar = async (id: string) => {
  try {
    const response = await axiosInstanceWithAuth.delete(`${env.beURL}/api/seminari/delete/${id}`);

    return response.data;
  } catch (error) {
    console.error("Error deleting seminar: ", error);
    throw error;
  }
};

export const fetchAllSeminars = async () => {
  try {
    const response = await axiosInstanceWithAuth.get(`${env.beURL}/api/seminari/all-seminars`);

    return response.data;
  } catch (error) {
    console.error("Error fetching all seminars: ", error);
    throw error;
  }
};
