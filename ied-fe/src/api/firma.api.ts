import type { FirmaType } from "../schemas/firmaSchemas";
import { env } from "../utils/envVariables";
import axiosInstanceWithAuth from "./interceptors/auth";
import type { FirmaQueryParams } from "@ied-shared/types/index";

export const fetchFirmaPretrage = async (
  pageSize: number,
  pageIndex: number,
  queryParameters: FirmaQueryParams
) => {
  try {
    const body = {
      pageSize: pageSize || 50,
      pageIndex: pageIndex + 1, // becuase MRT is zero based
      queryParameters,
    };

    const response: {
      data: { firmas: any[]; totalPages: number; totalDocuments: number };
    } = await axiosInstanceWithAuth.post(`${env.beURL}/api/firma/search`, body);
    return response.data;
  } catch (error) {
    console.error("Error fetching firma data:", error);
    throw error;
  }
};

export const fetchSingleFirma = async (id: string): Promise<FirmaType | null> => {
  try {
    const response = await axiosInstanceWithAuth.get(`${env.beURL}/api/firma/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching firma data:", error);
    throw error;
  }
};

export const exportData = async (queryParameters: any, exportSubject: "firma" | "zaposleni") => {
  try {
    const body = {
      queryParameters,
    };

    const response = await axiosInstanceWithAuth.post(
      `${env.beURL}/api/firma/export-${exportSubject}-data`,
      body
    );
    return response.data;
  } catch (error) {
    console.error("Error exporting firma data:", error);
    throw error;
  }
};

export const saveFirma = async (company: Partial<FirmaType>) => {
  company.zaposleni?.map((z) => {
    if (z._id?.startsWith("temp")) {
      delete z._id;
    }
  });

  try {
    if (company._id) {
      const response = await axiosInstanceWithAuth.post(
        `${env.beURL}/api/firma/${company._id}`,
        company
      );
      return {
        data: response.data,
        status: response.status,
      };
    }
    const response = await axiosInstanceWithAuth.post(`${env.beURL}/api/firma`, company);
    return {
      data: response.data,
      status: response.status,
    };
  } catch (error: any) {
    console.error("Error saving firma: ", error);
    // Throw the error so the caller can decide not to update state
    throw error;
  }
};

export const deleteFirma = async (id: string) => {
  try {
    const response = await axiosInstanceWithAuth.delete(`${env.beURL}/api/firma/${id}`);
    return {
      data: response.data,
      status: response.status,
    };
  } catch (error) {
    console.error("Error deleting firma: ", error);
    throw error;
  }
};
