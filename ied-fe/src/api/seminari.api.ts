import type {
  PrijavaZodType,
  SeminarQueryParams,
  SeminarZodType,
} from "@ied-shared/types/seminar.zod";
import axiosInstanceWithAuth from "./interceptors/auth";

export const createSeminar = async (seminarData: SeminarZodType) => {
  if (!seminarData.naziv) {
    console.error("Seminar must contain a name");
    return;
  }

  if (seminarData._id) {
    console.error("Seminar must not contain an id when creating a new seminar");
    return;
  }

  try {
    const response = await axiosInstanceWithAuth.post(
      `/api/seminari/create`,
      seminarData,
    );

    return response.data;
  } catch (error) {
    console.error("Error creating seminar: ", error);
    throw error;
  }
};

export const updateSeminar = async (seminarData: SeminarZodType) => {
  if (!seminarData.naziv) {
    console.error("Seminar must contain a name");
    return;
  }

  if (!seminarData._id) {
    console.error("Seminar must contain an id");
    return;
  }

  try {
    const response = await axiosInstanceWithAuth.post(
      `/api/seminari/update/${seminarData._id}`,
      seminarData,
    );

    return response.data;
  } catch (error) {
    console.error("Error creating seminar: ", error);
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
      pageSize: pageSize,
      pageIndex: pageIndex,
      ...queryParameters,
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

export const createPrijava = async (
  seminar_id: string,
  prijava: PrijavaZodType,
) => {
  const payload = {
    ...prijava,
  };
  try {
    const response = await axiosInstanceWithAuth.post(
      `/api/seminari/create-prijava/${seminar_id}`,
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
      `/api/seminari/delete-prijava/${seminar_id}/${zaposleni_id}`,
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

export const fetchFirmaSeminari = async (
  pageSize: number,
  pageIndex: number,
  queryParameters: any, // TODO: define type
) => {
  try {
    const body = {
      pageSize: pageSize,
      pageIndex: pageIndex,
      ...queryParameters,
    };

    const response = await axiosInstanceWithAuth.post(
      `/api/seminari/firma-seminari`,
      body,
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching seminari data:", error);
    throw error;
  }
};
