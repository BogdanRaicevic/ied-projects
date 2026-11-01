import type {
  ContactTypeEnum,
  ExportFirma,
  ExportZaposlenih,
  FirmaType,
  ParametriPretrage,
  ZaposleniType,
} from "ied-shared";
import axiosInstanceWithAuth from "./interceptors/auth";

export const fetchFirmaPretrage = async (
  pageSize: number,
  pageIndex: number,
  queryParameters: ParametriPretrage,
) => {
  const body = {
    pageSize: pageSize || 50,
    pageIndex: pageIndex || 0,
    queryParameters,
  };

  const response: {
    data: { firmas: any[]; totalPages: number; totalDocuments: number };
  } = await axiosInstanceWithAuth.post(`/api/firma/search`, body);
  return response.data;
};

export const fetchSingleFirma = async (id: string): Promise<FirmaType> => {
  const response = await axiosInstanceWithAuth.get(`/api/firma/${id}`);
  return response.data;
};

export const exportFirmaData = async (
  queryParameters: ParametriPretrage,
): Promise<ExportFirma> => {
  const body = {
    queryParameters,
  };

  const response = await axiosInstanceWithAuth.post(
    `/api/firma/export-firma-data`,
    body,
  );

  return response.data;
};

export const exportZaposleniData = async (
  queryParameters: ParametriPretrage,
): Promise<ExportZaposlenih> => {
  const body = {
    queryParameters,
  };

  const response = await axiosInstanceWithAuth.post(
    `/api/firma/export-zaposleni-data`,
    body,
  );

  return response.data;
};

export const createNewFirma = async (company: Partial<FirmaType>) => {
  const response = await axiosInstanceWithAuth.post(`/api/firma`, company);
  return {
    data: response.data,
    status: response.status,
  };
};

export const updateFirma = async (
  firmaId: string,
  firma: Partial<FirmaType>,
) => {
  if (!firmaId) {
    throw new Error("Firma ID is required for update");
  }

  const response = await axiosInstanceWithAuth.put<Partial<FirmaType>>(
    `/api/firma/${firmaId}`,
    firma,
  );
  return {
    data: response.data,
    status: response.status,
  };
};

export const deleteFirma = async (id: string) => {
  const response = await axiosInstanceWithAuth.delete(`/api/firma/${id}`);
  return {
    data: response.data,
    status: response.status,
  };
};

export const addZaposleniToFirma = async (
  firmaId: string,
  zaposleni: Partial<ZaposleniType>,
) => {
  const response = await axiosInstanceWithAuth.post(
    `/api/firma/${firmaId}/zaposleni`,
    zaposleni,
  );
  return {
    data: response.data,
    status: response.status,
  };
};

export const updateZaposleniInFirma = async (
  firmaId: string,
  zaposleniId: string,
  zaposleni: Partial<ZaposleniType>,
) => {
  const response = await axiosInstanceWithAuth.put(
    `/api/firma/${firmaId}/zaposleni/${zaposleniId}`,
    zaposleni,
  );
  return {
    data: response.data,
    status: response.status,
  };
};

export const deleteZaposleniFromFirma = async (
  firmaId: string,
  zaposleniId: string,
) => {
  const response = await axiosInstanceWithAuth.delete(
    `/api/firma/${firmaId}/zaposleni/${zaposleniId}`,
  );
  return {
    data: response.data,
    status: response.status,
  };
};

export const updateLastContactInFirma = async (
  firmaId: string,
  contactType: ContactTypeEnum,
) => {
  const response = await axiosInstanceWithAuth.put(
    `/api/firma/${firmaId}/last-contact?contactType=${contactType}`,
  );
  return {
    data: response.data,
    status: response.status,
  };
};
