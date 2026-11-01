import {
  type IzdavacRacuna,
  type PretrageRacunaType,
  type RacunType,
  RacunZod,
  type TipRacuna,
} from "ied-shared";
import axiosInstanceWithAuth from "./interceptors/auth";

export const getIzdavaciRacuna = async () => {
  const response = await axiosInstanceWithAuth.get(`/api/racuni/izdavaci`);
  return response.data;
};

export const searchRacuni = async (
  pageIndex: number,
  pageSize: number,
  queryParameters: PretrageRacunaType,
): Promise<{
  totalDocuments: number;
  totalPages: number;
  racuni: RacunType[];
}> => {
  const searchParams = {
    ...queryParameters,
    pageIndex,
    pageSize,
  };
  const response = await axiosInstanceWithAuth.post(
    `/api/racuni/search`,
    searchParams,
  );
  const rawData = response.data;
  const parsedData = rawData.racuni.map((racun: any) => RacunZod.parse(racun));

  return {
    totalDocuments: rawData.totalDocuments,
    totalPages: rawData.totalPages,
    racuni: parsedData,
  };
};

export const fetchRacunById = async (id: string): Promise<RacunType> => {
  const response = await axiosInstanceWithAuth.get(`/api/racuni/${id}`);
  return RacunZod.parse(response.data);
};

export const getRacunByPozivNaBrojAndIzdavac = async (
  pozivNaBroj: string,
  izdavacRacuna: IzdavacRacuna,
  tipRacuna?: TipRacuna,
): Promise<RacunType> => {
  const params = new URLSearchParams({
    pozivNaBroj: pozivNaBroj,
    izdavacRacuna: izdavacRacuna,
    ...(tipRacuna && { tipRacuna: tipRacuna }),
  });

  const response = await axiosInstanceWithAuth.get(
    `/api/racuni?${params.toString()}`,
  );
  return response.data;
};

export const saveNewRacun = async (racun: RacunType): Promise<RacunType> => {
  if (racun._id || racun.pozivNaBroj) {
    return racun; // or handle as needed
  }
  const response = await axiosInstanceWithAuth.post(`/api/racuni/save`, racun);
  return response.data;
};

export const updateRacunById = async (
  updatedRacun: RacunType,
): Promise<RacunType> => {
  const response = await axiosInstanceWithAuth.put(
    `/api/racuni/update/${updatedRacun._id}`,
    updatedRacun,
  );
  return response.data;
};
