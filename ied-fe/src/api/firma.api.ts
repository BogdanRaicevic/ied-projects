import type { ExportFirma, ExportZaposlenih } from "@ied-shared/index";
import type { FirmaQueryParams } from "@ied-shared/types/firma.zod";
import type { FirmaType } from "../schemas/firmaSchemas";
import axiosInstanceWithAuth from "./interceptors/auth";

export const fetchFirmaPretrage = async (
  pageSize: number,
  pageIndex: number,
  queryParameters: FirmaQueryParams,
) => {
  try {
    const body = {
      pageSize: pageSize || 50,
      pageIndex: pageIndex + 1, // becuase MRT is zero based
      queryParameters,
    };

    const response: {
      data: { firmas: any[]; totalPages: number; totalDocuments: number };
    } = await axiosInstanceWithAuth.post(`/api/firma/search`, body);
    return response.data;
  } catch (error) {
    console.error("Error fetching firma data:", error);
    throw error;
  }
};

export const fetchSingleFirma = async (id: string): Promise<FirmaType> => {
  try {
    const response = await axiosInstanceWithAuth.get(`/api/firma/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching single firma data:", error);
    throw error;
  }
};

export const exportFirmaData = async (
  queryParameters: FirmaQueryParams,
): Promise<{
  data: ExportFirma;
  duplicates: string[];
}> => {
  try {
    const body = {
      queryParameters,
    };

    const response = await axiosInstanceWithAuth.post(
      `/api/firma/export-firma-data`,
      body,
    );

    const firmeMap = new Map<string, number>();
    for (const element of response.data) {
      if (!element.e_mail) {
        continue; // Skip if e_mail is not present
      }
      if (firmeMap.has(element.e_mail)) {
        firmeMap.set(element.e_mail, firmeMap.get(element.e_mail)! + 1);
      } else {
        firmeMap.set(element.e_mail, 1);
      }
    }

    const duplicates = Array.from(firmeMap.entries())
      .filter(([_, count]) => count > 1)
      .map(([e_mail]) => e_mail);

    return {
      data: response.data,
      duplicates,
    };
  } catch (error) {
    console.error("Error exporting firma data:", error);
    throw error;
  }
};

export const exportZaposleniData = async (
  queryParameters: FirmaQueryParams,
): Promise<{
  data: ExportZaposlenih;
  duplicates: string[];
}> => {
  try {
    const body = {
      queryParameters,
    };

    const response = await axiosInstanceWithAuth.post(
      `/api/firma/export-zaposleni-data`,
      body,
    );

    const zaposleniMap = new Map<string, number>();
    for (const element of response.data) {
      if (!element.e_mail) {
        continue; // Skip if e_mail is not present
      }
      if (zaposleniMap.has(element.e_mail)) {
        zaposleniMap.set(element.e_mail, zaposleniMap.get(element.e_mail)! + 1);
      } else {
        zaposleniMap.set(element.e_mail, 1);
      }
    }

    const duplicates = Array.from(zaposleniMap.entries())
      .filter(([_, count]) => count > 1)
      .map(([e_mail]) => e_mail);

    return {
      data: response.data,
      duplicates,
    };
  } catch (error) {
    console.error("Error exporting zaposleni data:", error);
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
        `/api/firma/${company._id}`,
        company,
      );
      return {
        data: response.data,
        status: response.status,
      };
    }
    const response = await axiosInstanceWithAuth.post(`/api/firma`, company);
    return {
      data: response.data,
      status: response.status,
    };
  } catch (error: any) {
    console.error("Error saving firma: ", error);
    throw error;
  }
};

export const deleteFirma = async (id: string) => {
  try {
    const response = await axiosInstanceWithAuth.delete(`/api/firma/${id}`);
    return {
      data: response.data,
      status: response.status,
    };
  } catch (error) {
    console.error("Error deleting firma: ", error);
    throw error;
  }
};
