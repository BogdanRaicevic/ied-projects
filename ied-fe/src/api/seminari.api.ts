import axios from "axios";
import type {
  FirmaSeminarSearchParams,
  PrijavaZodType,
  SeminarQueryParams,
  SeminarZodType,
} from "ied-shared";
import axiosInstanceWithAuth from "./interceptors/auth";

export const createSeminar = async (seminarData: SeminarZodType) => {
  if (!seminarData.naziv) {
    throw new Error("Seminar must contain a name");
  }

  if (seminarData._id) {
    throw new Error(
      "Seminar must not contain an id when creating a new seminar",
    );
  }

  const response = await axiosInstanceWithAuth.post(
    `/api/seminari/create`,
    seminarData,
  );

  return response.data;
};

export const updateSeminar = async (seminarData: SeminarZodType) => {
  if (!seminarData.naziv) {
    throw new Error("Seminar must contain a name");
  }

  if (!seminarData._id) {
    throw new Error("Seminar must contain an id");
  }

  const response = await axiosInstanceWithAuth.post(
    `/api/seminari/update/${seminarData._id}`,
    seminarData,
  );

  return response.data;
};

export const fetchSeminari = async (
  pageSize: number,
  pageIndex: number,
  queryParameters: SeminarQueryParams,
) => {
  const body = {
    pageSize,
    pageIndex,
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
};

export const fetchSeminarById = async (id: string) => {
  const response = await axiosInstanceWithAuth.get(`/api/seminari/${id}`);

  return response.data;
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
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 409) {
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
  const response = await axiosInstanceWithAuth.delete(
    `/api/seminari/delete-prijava/${seminar_id}/${zaposleni_id}`,
  );

  return response.data;
};

export const deleteSeminar = async (id: string) => {
  const response = await axiosInstanceWithAuth.delete(
    `/api/seminari/delete/${id}`,
  );

  return response.data;
};

export const fetchFirmaSeminari = async (
  pageSize: number,
  pageIndex: number,
  queryParameters: FirmaSeminarSearchParams,
) => {
  const body = {
    pageSize,
    pageIndex,
    queryParameters,
  };

  const response = await axiosInstanceWithAuth.post(
    `/api/seminari/firma-seminari`,
    body,
  );

  return response.data;
};
