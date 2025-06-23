import axiosInstanceWithAuth from "./interceptors/auth";
import type {
  PrijavaZodType,
  SeminarQueryParams,
  SeminarZodType,
} from "@ied-shared/types/seminar.zod";

export const saveSeminar = async (seminarData: SeminarZodType) => {
  try {
    if (!seminarData.naziv) {
      console.error("Seminar must contain a name");
      return;
    }

    const response = await axiosInstanceWithAuth.post(
      `/api/seminari/save`,
      seminarData,
    );

    return response.data;
  } catch (error) {
    console.error("Error saving seminar: ", error);
    throw error;
  }
};

export const fetchSeminari = async (
  pageSize: number,
  pageIndex: number,
  queryParameters: SeminarQueryParams,
) => {
  try {
    const body = {
      pageSize: pageSize || 50,
      pageIndex: pageIndex + 1, // becuase MRT is zero based
      queryParameters,
    };

    const response: {
      data: {
        seminari: SeminarZodType[];
        totalPages: number;
        totalDocuments: number;
      };
    } = await axiosInstanceWithAuth.post(`/api/seminari/search`, body);

    return response.data;
  } catch (error) {
    console.error("Error fetching seminari data:", error);
    throw error;
  }
};

export const fetchSeminarById = async (id: string) => {
  try {
    const response = await axiosInstanceWithAuth.get(`/api/seminari/${id}`);

    return response.data;
  } catch (error) {
    console.error("Error fetching seminar data:", error);
    throw error;
  }
};

export const savePrijava = async (
  seminar_id: string,
  prijava: PrijavaZodType,
) => {
  const payload = {
    ...prijava,
    seminar_id,
  };
  try {
    const response = await axiosInstanceWithAuth.post(
      `/api/seminari/save-prijava`,
      payload,
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

export const deletePrijava = async (
  zaposleni_id: string,
  seminar_id: string,
) => {
  try {
    const response = await axiosInstanceWithAuth.delete(
      `/api/seminari/delete-prijava/?zaposleni_id=${zaposleni_id}&seminar_id=${seminar_id}`,
    );

    return response.data;
  } catch (error) {
    console.error("Error deleting prijava: ", error);
    throw error;
  }
};

export const deleteSeminar = async (id: string) => {
  try {
    const response = await axiosInstanceWithAuth.delete(
      `/api/seminari/delete/${id}`,
    );

    return response.data;
  } catch (error) {
    console.error("Error deleting seminar: ", error);
    throw error;
  }
};

export const fetchAllSeminars = async () => {
  try {
    const response = await axiosInstanceWithAuth.get(
      `/api/seminari/all-seminars`,
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching all seminars: ", error);
    throw error;
  }
};
