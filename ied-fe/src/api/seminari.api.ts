import type {
  FirmaSeminarSearchParams,
  PrijavaZodType,
  SeminarQueryParams,
  SeminarZodType,
} from "@ied-shared/types/seminar.zod";
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

  try {
    const response = await axiosInstanceWithAuth.post(
      `/api/seminari/create`,
      seminarData,
    );

    return response.data;
  } catch (error) {
    throw new Error(`Error creating seminar: ${(error as any).message}`);
  }
};

export const updateSeminar = async (seminarData: SeminarZodType) => {
  if (!seminarData.naziv) {
    throw new Error("Seminar must contain a name");
  }

  if (!seminarData._id) {
    throw new Error("Seminar must contain an id");
  }

  try {
    const response = await axiosInstanceWithAuth.post(
      `/api/seminari/update/${seminarData._id}`,
      seminarData,
    );

    return response.data;
  } catch (error) {
    throw new Error(`Error updating seminar: ${(error as any).message}`);
  }
};

export const fetchSeminari = async (
  pageSize: number,
  pageIndex: number,
  queryParameters: SeminarQueryParams,
) => {
  try {
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
  } catch (error) {
    throw new Error(`Error fetching seminari data: ${(error as any).message}`);
  }
};

export const fetchSeminarById = async (id: string) => {
  try {
    const response = await axiosInstanceWithAuth.get(`/api/seminari/${id}`);

    return response.data;
  } catch (error) {
    throw new Error(`Error fetching seminar data: ${(error as any).message}`);
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
    throw new Error(`Error creating prijava: ${(error as any).message}`);
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
    throw new Error(`Error deleting prijava: ${(error as any).message}`);
  }
};

export const deleteSeminar = async (id: string) => {
  try {
    const response = await axiosInstanceWithAuth.delete(
      `/api/seminari/delete/${id}`,
    );

    return response.data;
  } catch (error) {
    throw new Error(`Error deleting seminar: ${(error as any).message}`);
  }
};

export const fetchFirmaSeminari = async (
  pageSize: number,
  pageIndex: number,
  queryParameters: FirmaSeminarSearchParams,
) => {
  try {
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
  } catch (error) {
    throw new Error(`Error fetching seminari data: ${(error as any).message}`);
  }
};
